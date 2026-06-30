import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Trash2, AlertCircle } from 'lucide-react';
import {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  subscribeToMessages,
  type Message,
} from '../services/messages';
import { useAuth } from '../contexts/useAuth';
import { Avatar } from '../components/Avatar';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const formatDateSeparator = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

const isSameDay = (a: string, b: string) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const Chat: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const partnerName = (location.state as any)?.partnerName ?? 'Chat';
  const partnerAvatar = (location.state as any)?.partnerAvatar ?? null;
  const { user } = useAuth();

  // Fix 10: validate UUID before any API call
  const invalidId = !partnerId || !UUID_RE.test(partnerId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Fix 8: mark a specific message as read when partner reads it
  const markMessageRead = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, is_read: true } : m)),
    );
  }, []);

  // Fix 9: cursor-based load — pass oldest message's created_at as `before`
  const load = useCallback(async (before?: string, prepend = false) => {
    if (!partnerId) return;
    try {
      const res = await getMessages(partnerId, before);
      setHasMore(res.hasMore ?? false);
      setMessages((prev) =>
        prepend ? [...(res.messages ?? []), ...prev] : (res.messages ?? []),
      );
    } catch {}
  }, [partnerId]);

  useEffect(() => {
    if (invalidId || !user?.id) return;

    setLoading(true);
    load().finally(() => setLoading(false));

    markAsRead(partnerId!).catch(() => {});

    const unsub = subscribeToMessages(
      user.id,
      (msg) => {
        if (msg.sender_id === partnerId) {
          setMessages((prev) => [...prev, msg]);
          markAsRead(partnerId!).catch(() => {});
        }
      },
      (id) => removeMessage(id),
      (msgId) => markMessageRead(msgId),
    );

    return () => { unsub(); };
  }, [partnerId, user?.id, load, removeMessage, markMessageRead, invalidId]);

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!partnerId || !text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await sendMessage(partnerId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setText(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDelete = async (msgId: string) => {
    setDeletingId(msgId);
    try {
      await deleteMessage(msgId);
      removeMessage(msgId);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Fix 9: use oldest message timestamp as cursor
  const handleLoadMore = async () => {
    if (!hasMore) return;
    const oldest = messages[0]?.created_at;
    setLoadingMore(true);
    const prevHeight = scrollRef.current?.scrollHeight ?? 0;
    await load(oldest, true);
    // restore scroll position so new messages don't snap to top
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
      }
    });
    setLoadingMore(false);
  };

  // Fix 10: graceful error state for invalid partnerId
  if (invalidId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-white gap-4 px-6">
        <AlertCircle size={40} className="text-red-400" />
        <p className="font-bold text-lg">Conversación no encontrada</p>
        <p className="text-stone-400 text-sm text-center">El enlace es inválido o esta conversación no existe.</p>
        <button
          onClick={() => navigate('/messages')}
          className="mt-2 px-6 py-2.5 bg-lime-400 text-stone-950 rounded-xl font-bold text-sm"
        >
          Ver conversaciones
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-950" style={{ height: '100dvh', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="shrink-0"
        style={{
          background: 'rgba(12,10,9,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <Avatar url={partnerAvatar} name={partnerName} size={32} />
          <p className="text-white font-bold truncate">{partnerName}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-lime-400 animate-spin" />
          </div>
        ) : (
          <>
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-300 py-2 mb-4 transition-colors"
              >
                {loadingMore ? 'Cargando...' : 'Cargar mensajes anteriores'}
              </button>
            ) : messages.length > 0 && (
              <p className="text-center text-xs text-stone-700 py-2 mb-4">— Inicio de la conversación —</p>
            )}

            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              const showDate = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="text-center text-xs text-stone-600 my-3">
                      {formatDateSeparator(msg.created_at)}
                    </div>
                  )}
                  <div className={`flex mb-2 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {isMe && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className="self-center mr-1.5 p-1 rounded-lg text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Borrar mensaje"
                      >
                        {deletingId === msg.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? 'bg-lime-400 text-stone-950 rounded-br-sm'
                          : 'bg-stone-800 text-stone-100 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-stone-700 text-right' : 'text-stone-500'}`}>
                        {formatTime(msg.created_at)}
                        {/* Fix 8: live read receipt tick updates via realtime */}
                        {isMe && msg.is_read && <span className="ml-1">✓✓</span>}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        className="shrink-0 w-full"
        style={{
          background: 'rgba(12,10,9,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        }}
      >
      <div className="px-4 pt-3 max-w-lg mx-auto w-full">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            maxLength={2000}
            className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-stone-500 resize-none focus:outline-none focus:border-lime-400 transition-colors"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
            style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            {sending ? <Loader2 size={16} className="animate-spin text-stone-950" /> : <Send size={16} className="text-stone-950" />}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
