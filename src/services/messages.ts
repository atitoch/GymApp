import { authenticatedGet, authenticatedPost, authenticatedFetch, authenticatedDelete, getAuthToken } from '../utils/api';
import { onTokenRefreshed } from '../utils/authEvents';
import { supabaseRealtime } from '../config/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partner: { id: string; first_name?: string; last_name?: string; avatar_url?: string | null };
  lastMessage: {
    id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    fromMe: boolean;
  };
}

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await authenticatedGet<{ conversations: Conversation[] }>('/messages/conversations');
  return res.conversations ?? [];
};

// Fix 9: cursor-based pagination — pass `before` ISO timestamp to get older messages
export const getMessages = async (
  partnerId: string,
  before?: string,
): Promise<{ messages: Message[]; hasMore: boolean; pageSize: number }> => {
  const qs = before ? `?before=${encodeURIComponent(before)}` : '';
  return authenticatedGet(`/messages/${partnerId}${qs}`);
};

export const sendMessage = async (partnerId: string, content: string): Promise<Message> => {
  const res = await authenticatedPost<{ message: Message }>(`/messages/${partnerId}`, { content });
  return res.message;
};

export const markAsRead = (partnerId: string): Promise<void> => {
  const response = authenticatedFetch(`/messages/${partnerId}/read`, { method: 'PATCH' });
  return response.then(() => {});
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await authenticatedGet<{ unread: number }>('/messages/unread-count');
  return res.unread ?? 0;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await authenticatedDelete(`/messages/message/${messageId}`);
};

export const subscribeToMessages = (
  myUserId: string,
  onNewMessage: (msg: Message) => void,
  onDeleteMessage: (id: string) => void,
  onReadUpdate?: (msgId: string) => void,
) => {
  let channel: ReturnType<typeof supabaseRealtime.channel> | null = null;

  // El JWT del socket se renueva al suscribirse, pero un access token dura
  // poco; si expira mientras el chat está abierto, RLS empieza a bloquear
  // los postgres_changes y el chat deja de recibir mensajes sin avisar.
  // Cuando api.ts renueve el token (ver authEvents.ts), reautenticamos el
  // socket con el token nuevo para no perder la conexión silenciosamente.
  const unsubscribeFromTokenRefresh = onTokenRefreshed((newToken) => {
    supabaseRealtime.realtime.setAuth(newToken);
  });

  try {
    // La sesión vive en localStorage (login vía backend REST), no en el
    // cliente supabase-js; sin el JWT en el socket, RLS bloquea todos los
    // eventos de postgres_changes (auth.uid() es null para anon).
    const token = getAuthToken();
    if (token) supabaseRealtime.realtime.setAuth(token);

    // Nombre único por suscripción: el Header y el Chat se suscriben a la vez
    // y dos canales con el mismo topic en el mismo socket chocan (solo uno
    // recibe eventos).
    channel = supabaseRealtime
      .channel(`my-messages-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${myUserId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.eventType === 'INSERT') onNewMessage(payload.new as Message);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.eventType === 'DELETE' && payload.old?.id) {
            onDeleteMessage(payload.old.id);
          }
        },
      )
      // Fix 8: real-time read receipts — partner marked our message as read
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${myUserId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.eventType === 'UPDATE' && (payload.new as Message).is_read && onReadUpdate) {
            onReadUpdate((payload.new as Message).id);
          }
        },
      )
      .subscribe((status, err) => {
        // Log siempre: si algo falla en producción necesitamos verlo en consola
        console.info(`[Realtime] estado: ${status}${err ? ` — ${err.message}` : ''}`);
      });
  } catch (e) {
    console.warn('[Realtime] WebSocket not available, realtime disabled:', e);
  }

  return () => {
    unsubscribeFromTokenRefresh();
    if (channel) supabaseRealtime.removeChannel(channel).catch(() => {});
  };
};
