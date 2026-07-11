import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  getSystemHealth,
  getAuthEvents,
  type SystemHealth,
  type AuthEvent,
} from '../../services/admin';

const EVENT_TYPES = ['all', 'login_ok', 'login_fail', 'logout', 'register'];
const PAGE_SIZE = 25;

const eventBadgeClass = (type: string) => {
  if (type.includes('fail')) return 'bg-red-400/10 text-red-400 border border-red-400/30';
  if (type === 'login_ok') return 'bg-lime-400/10 text-lime-400 border border-lime-400/30';
  if (type === 'logout') return 'bg-stone-700 text-stone-400 border border-stone-600';
  return 'bg-blue-400/10 text-blue-400 border border-blue-400/30';
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const formatMemoryMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const dbLatencyColor = (ms: number) => {
  if (ms < 100) return 'text-green-400';
  if (ms < 500) return 'text-yellow-400';
  return 'text-red-400';
};

export const AdminSystemHealth: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = () =>
      getSystemHealth()
        .then(setHealth)
        .catch(() => setError('Error al cargar estado del sistema'))
        .finally(() => setLoading(false));

    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setEventsLoading(true);
    getAuthEvents({
      event_type: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
      limit: PAGE_SIZE,
      page: page + 1,
    })
      .then(data => { setEvents(data.events ?? []); setTotal(data.pagination?.total ?? 0); })
      .catch(() => setError('Error al cargar eventos'))
      .finally(() => setEventsLoading(false));
  }, [eventTypeFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-stone-100">Estado del sistema</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : health && (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p className="text-stone-400 text-xs mb-1">Uptime</p>
              <p className="text-stone-100 font-semibold">{formatUptime(health.uptime)}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs mb-1">DB Latencia</p>
              <p className={`font-semibold ${dbLatencyColor(health.dbLatencyMs)}`}>{health.dbLatencyMs}ms</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs mb-1">Heap usado</p>
              <p className="text-stone-100 font-semibold">{formatMemoryMB(health.memoryUsage.heapUsed)}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs mb-1">Heap total</p>
              <p className="text-stone-100 font-semibold">{formatMemoryMB(health.memoryUsage.heapTotal)}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs mb-1">RSS</p>
              <p className="text-stone-100 font-semibold">{formatMemoryMB(health.memoryUsage.rss)}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs mb-1">Node</p>
              <p className="text-stone-100 font-semibold">{health.nodeVersion}</p>
            </div>
            <div className="col-span-2">
              <p className="text-stone-400 text-xs mb-1">Timestamp</p>
              <p className="text-stone-300 text-sm">{new Date(health.timestamp).toLocaleString('es-MX')}</p>
            </div>
          </div>
        )}

        {/* Auth events table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-stone-100 font-semibold">Eventos de autenticación</h2>
            <select
              value={eventTypeFilter}
              onChange={e => { setEventTypeFilter(e.target.value); setPage(0); }}
              className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-stone-600"
            >
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'Todos los tipos' : t}</option>
              ))}
            </select>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-stone-400 text-center py-8">No hay eventos.</p>
          ) : (
            <>
              <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-stone-400 text-xs border-b border-stone-800">
                      <th className="text-left px-5 py-3">Timestamp</th>
                      <th className="text-left px-5 py-3">Tipo</th>
                      <th className="text-left px-5 py-3">Email</th>
                      <th className="text-left px-5 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id} className="border-b border-stone-800/50 last:border-0">
                        <td className="px-5 py-3 text-stone-400 text-xs">{formatDate(ev.created_at)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventBadgeClass(ev.event_type)}`}>
                            {ev.event_type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-stone-300 truncate max-w-[200px]">{ev.email ?? '—'}</td>
                        <td className="px-5 py-3 text-stone-400 font-mono text-xs">{ev.ip_address ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-sm">Página {page + 1} de {totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-stone-300 rounded-xl text-sm hover:bg-stone-700 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-stone-300 rounded-xl text-sm hover:bg-stone-700 transition-colors disabled:opacity-40"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
