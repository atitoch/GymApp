import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader2, ChevronRight, Flame, AlertTriangle, Clock } from 'lucide-react';
import { getMyClients, type ClientRelationship } from '../../services/coachDashboard';
import { Avatar } from '../../components/Avatar';

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : null;

const daysSince = (iso?: string | null): number | null => {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
};

const AdherenceBadge: React.FC<{ stats?: ClientRelationship['workout_stats'] }> = ({ stats }) => {
  if (!stats) return null;
  const days = daysSince(stats.last_workout_at);

  if (days === null) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-800 px-2 py-0.5 rounded-full">
        Sin entrenos
      </span>
    );
  }
  if (days <= 2) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-full">
        <Flame size={9} /> Activo
      </span>
    );
  }
  if (days <= 5) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
        <Clock size={9} /> {days}d sin entrenar
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
      <AlertTriangle size={9} /> {days}d inactivo
    </span>
  );
};

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

  const sorted = [...clients].sort((a, b) => {
    const da = daysSince(a.workout_stats?.last_workout_at) ?? 999;
    const db = daysSince(b.workout_stats?.last_workout_at) ?? 999;
    return db - da;
  });

  const inactive = clients.filter(c => (daysSince(c.workout_stats?.last_workout_at) ?? 999) > 5);
  const activeThisWeek = clients.filter(c => (c.workout_stats?.workouts_last_7_days ?? 0) > 0);

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
          <Users size={20} className="text-(--color-accent-400)" />
          <h1 className="text-lg font-black">Clientes activos</h1>
          {!loading && (
            <span className="ml-auto text-sm font-bold text-stone-500">{clients.length}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-(--color-accent-400) animate-spin" /></div>
        ) : clients.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
            <Users size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="font-bold text-white">Sin clientes activos</p>
            <p className="text-sm mt-1">Cuando aceptes solicitudes, tus clientes aparecerán aquí.</p>
          </div>
        ) : (
          <>
            {clients.length > 1 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 text-center">
                  <p className="text-xl font-black text-(--color-accent-400)">{activeThisWeek.length}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest">Esta semana</p>
                </div>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 text-center">
                  <p className={`text-xl font-black ${inactive.length > 0 ? 'text-red-400' : 'text-(--color-accent-400)'}`}>{inactive.length}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest">Inactivos +5d</p>
                </div>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 text-center">
                  <p className="text-xl font-black text-white">{clients.length}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest">Total</p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {sorted.map((client) => {
                const stats = client.workout_stats;
                const lastDate = fmtDate(stats?.last_workout_at);
                return (
                  <button
                    key={client.id}
                    onClick={() => navigate(`/coach/clients/${client.users?.id ?? client.user_id}`)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-(--color-accent-400)/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar url={client.users?.avatar_url} name={fullName(client)} size={40} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{fullName(client)}</p>
                          <AdherenceBadge stats={stats} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-500">
                          {lastDate && <span>Último: {lastDate}</span>}
                          {stats && stats.workouts_last_7_days > 0 && (
                            <span className="text-stone-400">{stats.workouts_last_7_days} esta semana</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-stone-600 group-hover:text-(--color-accent-400) transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
