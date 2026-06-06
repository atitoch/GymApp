import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Search } from 'lucide-react';
import { listCoaches, requestConnection, getMyConnections } from '../../services/coachDashboard';
import { PageHeader } from '../../components/PageHeader';

export const BrowseCoaches: React.FC = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  const specializations = useMemo(() => {
    const set = new Set(coaches.map((c) => c.specialization).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [coaches]);

  const filtered = useMemo(() => {
    return coaches.filter((c) => {
      const name = [c.users?.first_name, c.users?.last_name].filter(Boolean).join(' ').toLowerCase();
      const spec = (c.specialization ?? '').toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || spec.includes(q);
      const matchSpec = !specFilter || c.specialization === specFilter;
      return matchSearch && matchSpec;
    });
  }, [coaches, search, specFilter]);

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
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <PageHeader title="Entrenadores disponibles" icon={<Users className="w-5 h-5 text-lime-400" />} />
      <div className="max-w-4xl mx-auto p-6">
        {/* Search + filter */}
        {!loading && coaches.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-stone-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o especialización..."
                className="flex-1 bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none"
              />
            </div>
            {specializations.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSpecFilter('')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!specFilter ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                >
                  Todos
                </button>
                {specializations.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecFilter(specFilter === s ? '' : s)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${specFilter === s ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      {filtered.length === 0 && !loading ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center text-stone-400">
          {coaches.length === 0 ? 'No hay entrenadores disponibles en este momento.' : 'Sin resultados para esta búsqueda.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((coach) => {
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
    </div>
  );
};
