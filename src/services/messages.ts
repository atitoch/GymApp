import { authenticatedGet, authenticatedPost, authenticatedFetch } from '../utils/api';
import { supabase } from '../config/supabase';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

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

// Supabase Realtime subscription for new messages
export const subscribeToMessages = (
  myUserId: string,
  onNewMessage: (msg: Message) => void,
) => {
  const channel = supabase
    .channel('my-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${myUserId}`,
      },
      (payload: RealtimePostgresInsertPayload<Message>) => {
        onNewMessage(payload.new as Message);
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
