import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader2, ChevronRight } from 'lucide-react';
import { getMyClients, type ClientRelationship } from '../../services/coachDashboard';

export const CoachClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyClients().then(setClients).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fullName = (rel: ClientRelationship) => {
    const u = rel.users;
    if (!u) return rel.user_id;
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <Users size={20} className="text-lime-400" />
          <h1 className="text-lg font-black">Clientes activos</h1>
          {!loading && (
            <span className="ml-auto text-sm font-bold text-stone-500">{clients.length}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : clients.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
            <Users size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="font-bold text-white">Sin clientes activos</p>
            <p className="text-sm mt-1">Cuando aceptes solicitudes, tus clientes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => navigate(`/coach/clients/${client.users?.id ?? client.user_id}`)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-lime-400/40 transition-colors text-left group"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{fullName(client)}</p>
                  <p className="text-stone-400 text-sm truncate">{client.users?.email}</p>
                </div>
                <ChevronRight size={16} className="text-stone-600 group-hover:text-lime-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
