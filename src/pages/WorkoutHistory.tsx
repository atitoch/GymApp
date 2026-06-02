import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Flame,
  Search,
  XCircle,
  Filter,
  Star,
  Zap,
} from 'lucide-react';
import { getWorkoutHistory, getWeeklyStats } from '../services/workoutLog';
import type { WorkoutLog } from '../types/workoutLog';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'PUSH' | 'PULL' | 'LEG' | 'DESCANSO';

interface SessionWithDayInfo extends WorkoutLog {
  day_name?: string;
  day_index?: number;
  day_title?: string;
}

interface WeeklyStats {
  total_sessions: number;
  completed_sessions: number;
  days_trained: number;
  total_duration_min: number;
  total_volume: number;
  avg_rating: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_STYLES: Record<string, { bg: string; text: string; border: string }> =
  {
    PUSH: {
      bg: 'rgba(59,130,246,0.12)',
      text: '#60a5fa',
      border: 'rgba(59,130,246,0.25)',
    },
    PULL: {
      bg: 'rgba(139,92,246,0.12)',
      text: '#a78bfa',
      border: 'rgba(139,92,246,0.25)',
    },
    LEG: {
      bg: 'rgba(16,185,129,0.12)',
      text: '#34d399',
      border: 'rgba(16,185,129,0.25)',
    },
    DESCANSO: {
      bg: 'rgba(100,116,139,0.12)',
      text: '#94a3b8',
      border: 'rgba(100,116,139,0.25)',
    },
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function groupByMonth(
  sessions: SessionWithDayInfo[],
): [string, SessionWithDayInfo[]][] {
  const groups: Record<string, SessionWithDayInfo[]> = {};
  for (const s of sessions) {
    const d = new Date(s.workout_date + 'T12:00:00');
    const key = d.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return Object.entries(groups);
}

// ─── Components ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl animate-pulse"
          style={{
            background: 'rgba(255,255,255,0.04)',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

function StatsSummary({
  stats,
  total,
}: {
  stats: WeeklyStats | null;
  total: number;
}) {
  const cards = [
    {
      label: 'Entrenos totales',
      value: total,
      icon: Dumbbell,
      color: '#3b82f6',
    },
    {
      label: 'Esta semana',
      value: stats?.days_trained ?? '—',
      icon: Flame,
      color: '#f59e0b',
    },
    {
      label: 'Min esta semana',
      value: stats?.total_duration_min ? `${stats.total_duration_min}m` : '—',
      icon: Clock,
      color: '#8b5cf6',
    },
    {
      label: 'Volumen semana',
      value: stats?.total_volume
        ? `${Math.round(stats.total_volume / 1000)}t`
        : '—',
      icon: TrendingUp,
      color: '#10b981',
    },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Icon size={15} style={{ color }} className="mb-1.5" />
          <p className="text-xl font-black leading-none" style={{ color }}>
            {value}
          </p>
          <p className="text-xs text-stone-600 mt-1 font-medium leading-tight">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SessionCard({ session }: { session: SessionWithDayInfo }) {
  const style = DAY_STYLES[session.day_name ?? ''] ?? DAY_STYLES.PUSH;
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {session.day_name && (
              <span
                className="text-xs font-black px-2 py-0.5 rounded-lg"
                style={{
                  background: style.bg,
                  color: style.text,
                  border: `1px solid ${style.border}`,
                }}
              >
                {session.day_name}
              </span>
            )}
            {session.day_title && (
              <span className="text-xs text-stone-500 truncate max-w-[160px]">
                {session.day_title}
              </span>
            )}
            {session.completed_at && (
              <span className="text-xs text-emerald-500 font-bold">✓</span>
            )}
          </div>
          <p className="text-sm font-semibold text-stone-300">
            {formatDate(session.workout_date)}
          </p>
          {session.notes && (
            <p className="text-xs text-stone-600 mt-0.5 italic truncate">
              {session.notes}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {!!session.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <Clock size={11} />
                {session.duration_minutes} min
              </span>
            )}
            {!!session.total_volume && (
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <Zap size={11} />
                {Math.round(session.total_volume as number).toLocaleString()} kg
              </span>
            )}
            {session.rating != null && (
              <span className="flex items-center gap-1 text-xs text-yellow-500 font-semibold">
                <Star size={11} />
                {session.rating}/10
              </span>
            )}
          </div>
        </div>
        {session.energy_level != null && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-stone-600">Energía</p>
            <p
              className="text-sm font-black"
              style={{
                color:
                  (session.energy_level as number) >= 7
                    ? '#34d399'
                    : (session.energy_level as number) >= 4
                      ? '#f59e0b'
                      : '#f87171',
              }}
            >
              {session.energy_level}/10
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithDayInfo[]>([]);
  const [weekStats, setWeekStats] = useState<WeeklyStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hist, stats] = await Promise.all([
        getWorkoutHistory({
          limit: PAGE_SIZE,
          offset: 0,
          dayName: filter !== 'all' ? filter : undefined,
        }),
        getWeeklyStats(),
      ]);
      setSessions(hist.sessions as SessionWithDayInfo[]);
      setTotal(hist.total);
      setWeekStats(stats as WeeklyStats);
      setOffset(PAGE_SIZE);
    } catch {
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setSessions([]);
    setOffset(0);
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loadingMore || sessions.length >= total) return;
    setLoadingMore(true);
    try {
      const result = await getWorkoutHistory({
        limit: PAGE_SIZE,
        offset,
        dayName: filter !== 'all' ? filter : undefined,
      });
      setSessions((p) => [...p, ...(result.sessions as SessionWithDayInfo[])]);
      setOffset((p) => p + PAGE_SIZE);
    } catch {
      /* silencioso */
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.day_name ?? '').toLowerCase().includes(q) ||
      (s.day_title ?? '').toLowerCase().includes(q) ||
      (s.notes ?? '').toLowerCase().includes(q) ||
      formatDate(s.workout_date).toLowerCase().includes(q)
    );
  });

  const grouped = groupByMonth(filtered);

  const filterOpts: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'PUSH', label: 'Push' },
    { value: 'PULL', label: 'Pull' },
    { value: 'LEG', label: 'Leg' },
    { value: 'DESCANSO', label: 'Descanso' },
  ];

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 100%)' }}
    >
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Historial</h1>
            <p className="text-xs text-stone-500">
              {total} entrenos registrados
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!loading && <StatsSummary stats={weekStats} total={total} />}

        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search size={15} className="text-stone-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tipo, fecha, notas..."
            className="flex-1 bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-stone-500 hover:text-white transition-colors"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {filterOpts.map(({ value, label }) => {
            const active = filter === value;
            const s = value !== 'all' ? DAY_STYLES[value] : null;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active
                    ? (s?.bg ?? 'rgba(99,102,241,0.2)')
                    : 'rgba(255,255,255,0.04)',
                  color: active ? (s?.text ?? '#a5b4fc') : '#64748b',
                  border: active
                    ? `1px solid ${s?.border ?? 'rgba(99,102,241,0.35)'}`
                    : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <Filter size={11} />
                {label}
              </button>
            );
          })}
        </div>

        {loading && <Skeleton />}

        {error && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadInitial}
              className="mt-2 text-xs text-red-300 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={44} className="text-stone-700 mx-auto mb-3" />
            <p className="text-stone-500 font-semibold">
              {sessions.length === 0
                ? 'Sin entrenos registrados aún'
                : 'Sin resultados'}
            </p>
            <p className="text-stone-600 text-sm mt-1">
              {sessions.length === 0
                ? 'Completa tu primer workout para verlo aquí'
                : 'Prueba quitando filtros'}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          grouped.map(([month, list]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-600 capitalize">
                  {month}
                </h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
                <span className="text-xs text-stone-700">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </div>
          ))}

        {!loading && !error && sessions.length < total && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-stone-400 hover:text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {loadingMore
              ? 'Cargando...'
              : `Ver más (${total - sessions.length} restantes)`}
          </button>
        )}
      </div>
    </div>
  );
}
