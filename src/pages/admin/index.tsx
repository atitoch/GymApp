import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, ClipboardList, Dumbbell, Activity, ArrowRight, Loader2 } from 'lucide-react';
import {
  getAdminStats,
  getSystemHealth,
  getAuthEventsSummary,
  type AdminStats,
  type SystemHealth,
  type AuthEventsSummary,
} from '../../services/admin';

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

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [eventSummary, setEventSummary] = useState<AuthEventsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminStats(), getSystemHealth(), getAuthEventsSummary()])
      .then(([s, h, e]) => {
        setStats(s);
        setHealth(h);
        setEventSummary(e);
      })
      .catch(() => setError('Error al cargar datos del panel'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-7 h-7 text-lime-400" />
          <h1 className="text-2xl font-bold text-stone-100">Panel de Administración</h1>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-stone-400" />
              <span className="text-stone-400 text-xs">Total usuarios</span>
            </div>
            <p className="text-3xl font-bold text-lime-400">{stats?.users.total ?? '—'}</p>
          </div>
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-stone-400" />
              <span className="text-stone-400 text-xs">Coaches activos</span>
            </div>
            <p className="text-3xl font-bold text-lime-400">{stats?.users.byRole?.coach ?? '—'}</p>
          </div>
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-stone-400" />
              <span className="text-stone-400 text-xs">Solicitudes pendientes</span>
            </div>
            <p className="text-3xl font-bold text-lime-400">{stats?.applications.pending ?? '—'}</p>
          </div>
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-4 h-4 text-stone-400" />
              <span className="text-stone-400 text-xs">Total rutinas</span>
            </div>
            <p className="text-3xl font-bold text-lime-400">{stats?.routines.total ?? '—'}</p>
          </div>
        </div>

        {/* System health */}
        {health && (
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-lime-400" />
              <h2 className="text-stone-100 font-semibold">Estado del sistema</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs mb-1">Uptime</p>
                <p className="text-stone-100 font-medium">{formatUptime(health.uptime)}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">DB Latencia</p>
                <p className={`font-medium ${dbLatencyColor(health.dbLatencyMs)}`}>{health.dbLatencyMs}ms</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Memoria usada</p>
                <p className="text-stone-100 font-medium">{formatMemoryMB(health.memory.heapUsed)}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Node</p>
                <p className="text-stone-100 font-medium">{health.nodeVersion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auth events summary */}
        {eventSummary && (
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
            <h2 className="text-stone-100 font-semibold mb-4">Resumen de eventos de autenticación</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-stone-400 text-xs border-b border-stone-800">
                    <th className="text-left py-2 pr-4">Evento</th>
                    <th className="text-right py-2 pr-4">Últimas 24h</th>
                    <th className="text-right py-2">Últimos 7d</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(eventSummary.last24h).map(([type, count]) => (
                    <tr key={type} className="border-b border-stone-800/50">
                      <td className="py-2 pr-4 text-stone-300 font-mono text-xs">{type}</td>
                      <td className={`py-2 pr-4 text-right font-medium ${type === 'login_fail' && count > 10 ? 'text-red-400' : 'text-stone-100'}`}>
                        {count}
                      </td>
                      <td className="py-2 text-right text-stone-300">{eventSummary.last7d[type] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Ver solicitudes', path: '/admin/applications' },
            { label: 'Ver usuarios', path: '/admin/users' },
            { label: 'Ver coaches', path: '/admin/coaches' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-2xl p-4 flex items-center justify-between text-stone-100 transition-colors"
            >
              <span className="font-medium">{label}</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
