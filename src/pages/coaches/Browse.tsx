import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { listCoaches, requestConnection, getMyConnections } from '../../services/coachDashboard';

export const BrowseCoaches: React.FC = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listCoaches(), getMyConnections()]).then(([c, conn]) => {
      setCoaches(c ?? []);
      setConnections(conn ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const getConnectionStatus = (coachId: string): string | null => {
    const rel = connections.find((c: any) => c.coach_id === coachId || c.coaches?.id === coachId);
    return rel?.status ?? null;
  };

  const handleRequest = async (coachId: string) => {
    setRequesting(coachId);
    try {
      await requestConnection(coachId);
      const conn = await getMyConnections();
      setConnections(conn ?? []);
    } finally {
      setRequesting(null);
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Solicitud enviada',
    active: 'Conectado',
    rejected: 'Rechazado',
  };

  const STATUS_CLASSES: Record<string, string> = {
    pending: 'bg-yellow-900 text-yellow-300',
    active: 'bg-lime-900 text-lime-300',
    rejected: 'bg-red-900 text-red-300',
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Users className="w-8 h-8 text-lime-400 animate-bounce" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-lime-400" />
        <h1 className="text-3xl font-bold">Entrenadores disponibles</h1>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center text-stone-400">
          No hay entrenadores disponibles en este momento.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coaches.map((coach) => {
            const name = [coach.users?.first_name, coach.users?.last_name].filter(Boolean).join(' ') || 'Entrenador';
            const status = getConnectionStatus(coach.id);

            return (
              <div
                key={coach.id}
                className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:border-stone-700 transition-colors"
                onClick={() => navigate(`/coaches/${coach.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{name}</h2>
                    {coach.specialization && (
                      <p className="text-lime-400 text-sm">{coach.specialization}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-stone-600 shrink-0 mt-1" />
                </div>
                {coach.bio && (
                  <p className="text-stone-400 text-sm line-clamp-2">{coach.bio}</p>
                )}
                <div className="flex gap-4 text-sm text-stone-400">
                  {coach.years_experience != null && (
                    <span>{coach.years_experience} años exp.</span>
                  )}
                  {coach.hourly_rate != null && (
                    <span>${coach.hourly_rate}/hr</span>
                  )}
                </div>
                <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                  {status ? (
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${STATUS_CLASSES[status] ?? 'bg-stone-700 text-stone-300'}`}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRequest(coach.id)}
                      disabled={requesting === coach.id}
                      className="w-full px-4 py-2 bg-lime-400 text-black font-medium text-sm rounded-lg hover:bg-lime-300 disabled:opacity-50 transition-colors"
                    >
                      {requesting === coach.id ? 'Enviando...' : 'Solicitar conexión'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
