import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Loader2, Circle } from 'lucide-react';
import { getConversations, type Conversation } from '../services/messages';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col bg-stone-950" style={{ height: '100dvh', minHeight: '100vh' }}>
      <div
        className="shrink-0 z-20"
        style={{
          background: 'rgba(12,10,9,0.90)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <MessageSquare size={20} className="text-lime-400" />
          <h1 className="text-lg font-black text-white">Mensajes</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="text-lime-400 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-stone-900 rounded-2xl p-8 border border-stone-800 text-center">
            <MessageSquare size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="text-white font-bold">Sin conversaciones</p>
            <p className="text-sm text-stone-400 mt-1">Los mensajes de tu coach aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const name = [conv.partner.first_name, conv.partner.last_name]
                .filter(Boolean)
                .join(' ') || 'Usuario';
              const unread = !conv.lastMessage.is_read && !conv.lastMessage.fromMe;

              return (
                <button
                  key={conv.partner.id}
                  onClick={() => navigate(`/messages/${conv.partner.id}`, { state: { partnerName: name } })}
                  className="w-full text-left bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl p-4 flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0 text-lime-400 font-bold">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-bold truncate ${unread ? 'text-white' : 'text-stone-300'}`}>{name}</p>
                      <span className="text-xs text-stone-500 shrink-0">
                        {formatTime(conv.lastMessage.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {conv.lastMessage.fromMe && (
                        <span className="text-xs text-stone-500">Tú:</span>
                      )}
                      <p className={`text-sm truncate ${unread ? 'text-stone-200' : 'text-stone-500'}`}>
                        {conv.lastMessage.content}
                      </p>
                      {unread && (
                        <Circle size={8} className="text-lime-400 fill-lime-400 shrink-0 ml-auto" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
