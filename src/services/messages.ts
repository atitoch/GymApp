import { authenticatedGet, authenticatedPost, authenticatedFetch, authenticatedDelete, getAuthToken } from '../utils/api';
import { supabase } from '../config/supabase';
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
  partner: { id: string; first_name?: string; last_name?: string };
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

export const getMessages = async (
  partnerId: string,
  page = 0,
): Promise<{ messages: Message[]; total: number; page: number; pageSize: number }> => {
  return authenticatedGet(`/messages/${partnerId}?page=${page}`);
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
) => {
  let channel: ReturnType<typeof supabase.channel> | null = null;

  try {
    // La sesión vive en localStorage (login vía backend REST), no en el
    // cliente supabase-js; sin el JWT en el socket, RLS bloquea todos los
    // eventos de postgres_changes (auth.uid() es null para anon).
    const token = getAuthToken();
    if (token) supabase.realtime.setAuth(token);

    // Nombre único por suscripción: el Header y el Chat se suscriben a la vez
    // y dos canales con el mismo topic en el mismo socket chocan (solo uno
    // recibe eventos).
    channel = supabase
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
      .subscribe((_status, err) => {
        if (err) console.warn('[Realtime] subscription error:', err);
      });
  } catch (e) {
    console.warn('[Realtime] WebSocket not available, realtime disabled:', e);
  }

  return () => {
    if (channel) supabase.removeChannel(channel).catch(() => {});
  };
};
