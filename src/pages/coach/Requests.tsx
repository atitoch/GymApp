import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getPendingRequests, acceptRequest, rejectRequest, type ClientRelationship } from '../../services/coachDashboard';

export const CoachRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ClientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () =>
    getPendingRequests().then(setRequests).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setActingId(id);
    try {
      await (action === 'accept' ? acceptRequest(id) : rejectRequest(id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {} finally {
      setActingId(null);
    }
  };

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
          <Clock size={20} className="text-yellow-400" />
          <h1 className="text-lg font-black">Solicitudes pendientes</h1>
          {!loading && (
            <span className="ml-auto text-sm font-bold text-stone-500">{requests.length}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
            <Clock size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="font-bold text-white">Sin solicitudes pendientes</p>
            <p className="text-sm mt-1">Las solicitudes de conexión de nuevos clientes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{fullName(req)}</p>
                  <p className="text-stone-400 text-sm truncate">{req.users?.email}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(req.id, 'accept')}
                    disabled={actingId === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black font-medium text-sm hover:bg-lime-300 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actingId === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/40 text-red-400 font-medium text-sm hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
