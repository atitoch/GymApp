import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Download,
  Trophy,
  Loader2,
} from 'lucide-react';
import {
  getWorkoutHistory,
  getWeeklyStats,
  getExerciseHistory,
  getExerciseNames,
  type ExerciseNameSuggestion,
} from '../services/workoutLog';
import { filterExerciseSuggestions } from '../utils/exerciseSearch';
import { getSetWeightInUnit, isStoredInOtherUnit, convertWeight, type WeightUnit } from '../utils/weight';
import { getUserProfile } from '../services/profile';
import type { WorkoutLog, ExerciseLog } from '../types/workoutLog';

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
  unit,
}: {
  stats: WeeklyStats | null;
  total: number;
  unit: WeightUnit;
}) {
  // total_volume viene en kg (unidad canónica del backend)
  const weekVolume = stats?.total_volume
    ? convertWeight(Number(stats.total_volume), 'kg', unit)
    : 0;
  const cards = [
    {
      label: 'Entrenos totales',
      value: total,
      icon: Dumbbell,
      color: '#a3e635',
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
      label: `Volumen semana (${unit})`,
      value: weekVolume ? `${Math.round(weekVolume / 1000)}k` : '—',
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

function SessionCard({ session, unit }: { session: SessionWithDayInfo; unit: WeightUnit }) {
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
                {Math.round(
                  convertWeight(Number(session.total_volume), 'kg', unit),
                ).toLocaleString()}{' '}
                {unit}
              </span>
            )}
            {session.rating != null && (
              <span className="flex items-center gap-1 text-xs text-yellow-500 font-semibold">
                <Star size={11} />
                {session.rating}/5
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

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportCSV(sessions: SessionWithDayInfo[]) {
  const headers = ['Fecha', 'Tipo', 'Título', 'Duración (min)', 'Volumen (kg)', 'Rating', 'Energía', 'Notas'];
  const rows = sessions.map((s) => [
    s.workout_date,
    s.day_name ?? '',
    s.day_title ?? '',
    s.duration_minutes ?? '',
    s.total_volume ?? '',
    s.rating ?? '',
    s.energy_level ?? '',
    (s.notes ?? '').replace(/,/g, ' '),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `entrenamientos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Exercise Progress Chart ──────────────────────────────────────────────────

// La gráfica se dibuja en la unidad preferida del usuario, convirtiendo los
// sets guardados en la otra unidad (p. ej. sesiones viejas en kg de cuando
// el perfil estaba en kg) en vez de mezclar escalas.
function ExerciseProgressChart({ unit }: { unit: WeightUnit }) {
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [raw, setRaw] = useState<{ date: string; sets: ExerciseLog[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const data = useMemo(
    () =>
      raw
        .map((entry) => {
          const w = Math.max(0, ...entry.sets.map((s) => getSetWeightInUnit(s, unit)));
          return { date: entry.date, weight: Math.round(w * 10) / 10 };
        })
        .filter((p) => p.weight > 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [raw, unit],
  );

  // ¿Hay sesiones guardadas en la otra unidad? (para avisar que se convirtió)
  const hasConverted = useMemo(
    () => raw.some((e) => e.sets.some((s) => isStoredInOtherUnit(s, unit))),
    [raw, unit],
  );

  // Autocompletado: ejercicios que el usuario ya registró, por frecuencia
  const [allNames, setAllNames] = useState<ExerciseNameSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    getExerciseNames()
      .then(setAllNames)
      .catch(() => {});
  }, []);

  const suggestions = filterExerciseSuggestions(allNames, query, 6);

  const search = useCallback(async (name: string) => {
    const n = name.trim();
    if (!n) return;
    setCommitted(n);
    setLoading(true);
    setSearched(true);
    setSuggestionsOpen(false);
    try {
      const history = await getExerciseHistory(n, 40);
      setRaw(history);
    } catch {
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectSuggestion = (name: string) => {
    setQuery(name);
    setActiveIdx(-1);
    search(name);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (suggestionsOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if (e.key === 'Escape') {
        setSuggestionsOpen(false);
        setActiveIdx(-1);
        return;
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        selectSuggestion(suggestions[activeIdx].name);
        return;
      }
    }
    if (e.key === 'Enter') search(query);
  };

  // ── SVG line chart ──────────────────────────────────────────────────────────
  const renderChart = () => {
    if (data.length < 2) return null;

    const W = 400, H = 110;
    const padL = 36, padR = 12, padT = 14, padB = 24;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    const weights = data.map((d) => d.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;

    const prIdx = weights.indexOf(maxW);

    const pts = data.map((d, i) => ({
      x: padL + (i / (data.length - 1)) * cW,
      y: padT + cH - ((d.weight - minW) / range) * cH,
      ...d,
    }));

    const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const area = `M${pts[0].x},${padT + cH} ` +
      pts.map((p) => `L${p.x},${p.y}`).join(' ') +
      ` L${pts[pts.length - 1].x},${padT + cH} Z`;

    // Y axis labels
    const yLabels = [minW, (minW + maxW) / 2, maxW].map((v, i) => ({
      y: padT + cH - (i / 2) * cH,
      label: `${Math.round(v)}`,
    }));

    // X axis labels: only first, middle, last
    const xIdxs = [0, Math.floor((data.length - 1) / 2), data.length - 1];
    const xLabels = xIdxs.map((i) => ({
      x: pts[i].x,
      label: new Date(pts[i].date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    }));

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#a3e635" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((yl, i) => (
          <line key={i} x1={padL} x2={W - padR} y1={yl.y} y2={yl.y}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* Y labels */}
        {yLabels.map((yl, i) => (
          <text key={i} x={padL - 4} y={yl.y + 4} textAnchor="end"
            fontSize="9" fill="rgba(255,255,255,0.3)">{yl.label}</text>
        ))}

        {/* Area */}
        <path d={area} fill="url(#pg)" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#a3e635" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === prIdx ? 5 : 3}
            fill={i === prIdx ? '#a3e635' : '#1c1917'}
            stroke={i === prIdx ? '#a3e635' : 'rgba(163,230,53,0.5)'}
            strokeWidth="2" />
        ))}

        {/* PR label */}
        <text x={pts[prIdx].x} y={pts[prIdx].y - 10} textAnchor="middle"
          fontSize="10" fontWeight="bold" fill="#a3e635">
          {maxW} {unit} ★
        </text>

        {/* X labels */}
        {xLabels.map((xl, i) => (
          <text key={i} x={xl.x} y={H - 4} textAnchor="middle"
            fontSize="9" fill="rgba(255,255,255,0.3)">{xl.label}</text>
        ))}
      </svg>
    );
  };

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-lime-400 shrink-0" />
        <p className="text-xs font-black uppercase tracking-widest text-stone-500 flex-1">
          Progreso por ejercicio
        </p>
        {data.length >= 2 && (
          <span className="text-xs font-bold text-lime-400 flex items-center gap-1">
            <Trophy size={11} /> PR: {Math.max(...data.map((d) => d.weight))} {unit}
          </span>
        )}
      </div>

      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={13} className="text-stone-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSuggestionsOpen(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => { setSuggestionsOpen(false); setActiveIdx(-1); }}
            onKeyDown={handleKey}
            placeholder="Escribe o elige un ejercicio..."
            className="flex-1 bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setRaw([]); setSearched(false); }} className="text-stone-600 hover:text-stone-400">
              <XCircle size={13} />
            </button>
          )}
          <button
            onClick={() => search(query)}
            disabled={!query.trim() || loading}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-950 disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : 'Ver'}
          </button>
        </div>

        {suggestionsOpen && suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl overflow-hidden animate-[fadeIn_0.2s_ease-out_forwards]"
            style={{
              background: 'rgba(28,25,23,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            {suggestions.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  // onMouseDown en vez de onClick: se dispara antes del blur
                  // del input, que cierra el dropdown
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s.name);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors"
                  style={{
                    background: i === activeIdx ? 'rgba(163,230,53,0.12)' : 'transparent',
                  }}
                >
                  <span
                    className="text-sm truncate"
                    style={{ color: i === activeIdx ? '#d9f99d' : '#d6d3d1' }}
                  >
                    {s.name}
                  </span>
                  <span className="text-[10px] text-stone-600 shrink-0 tabular-nums">
                    {s.sessions} {s.sessions === 1 ? 'sesión' : 'sesiones'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="text-lime-400 animate-spin" />
        </div>
      )}

      {!loading && searched && data.length === 0 && (
        <p className="text-center text-xs text-stone-600 py-4">
          Sin pesos registrados para <strong className="text-stone-500">{committed}</strong>.
        </p>
      )}

      {!loading && data.length === 1 && (
        <p className="text-center text-xs text-stone-600 py-4">
          Solo hay 1 sesión registrada. Completa más entrenamientos para ver la evolución.
        </p>
      )}

      {!loading && data.length >= 2 && (
        <div>
          {renderChart()}
          <p className="text-[10px] text-stone-700 text-center mt-1">
            {data.length} sesiones · peso máximo por sesión en {unit}
            {hasConverted && (
              <>
                {' '}· incluye sesiones registradas en{' '}
                {unit === 'lbs' ? 'kg' : 'lbs'} convertidas a {unit}
              </>
            )}
          </p>
        </div>
      )}

      {!searched && (
        <p className="text-[11px] text-stone-700 text-center pb-1">
          Toca el buscador y elige un ejercicio de la lista
        </p>
      )}
    </div>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyChart({ sessions }: { sessions: SessionWithDayInfo[] }) {
  // Build last 8 weeks: count completed sessions per week (Mon-Sun)
  const weeks: { label: string; count: number }[] = [];
  const now = new Date();
  for (let w = 7; w >= 0; w--) {
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1 - w * 7);
    mon.setHours(0, 0, 0, 0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    const count = sessions.filter((s) => {
      const d = new Date(s.workout_date + 'T12:00:00');
      return d >= mon && d <= sun && s.completed_at;
    }).length;
    const label = mon.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    weeks.push({ label, count });
  }

  const max = Math.max(...weeks.map((w) => w.count), 1);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs font-black uppercase tracking-widest text-stone-600 mb-4">
        Sesiones por semana (últimas 8)
      </p>
      <div className="flex items-end gap-1.5 h-20">
        {weeks.map(({ label, count }, i) => {
          const isCurrentWeek = i === 7;
          const pct = (count / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-stone-600 font-bold">{count > 0 ? count : ''}</span>
              <div className="w-full rounded-t-md transition-all" style={{
                height: `${Math.max(pct, count === 0 ? 4 : 8)}%`,
                background: isCurrentWeek
                  ? 'linear-gradient(180deg,#a3e635,#65a30d)'
                  : count > 0
                    ? 'rgba(163,230,53,0.35)'
                    : 'rgba(255,255,255,0.05)',
                minHeight: '4px',
              }} />
              <span
                className="text-[9px] text-stone-700 truncate w-full text-center"
                title={label}
              >
                {label.split(' ')[0]}
              </span>
            </div>
          );
        })}
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
  // Unidad de peso preferida del usuario — todos los pesos/volúmenes de la
  // página se muestran convertidos a ella
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  useEffect(() => {
    getUserProfile()
      .then((p) => {
        if (p?.weight_unit === 'kg' || p?.weight_unit === 'lbs') setWeightUnit(p.weight_unit);
      })
      .catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const loadVersionRef = useRef(0);

  const loadInitial = useCallback(async () => {
    const version = ++loadVersionRef.current;
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
      if (version !== loadVersionRef.current) return;
      setSessions(hist.sessions as SessionWithDayInfo[]);
      setTotal(hist.total);
      setWeekStats(stats as WeeklyStats);
      setOffset(PAGE_SIZE);
    } catch {
      if (version !== loadVersionRef.current) return;
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
      style={{ background: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 100%)' }}
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
          <div className="flex-1">
            <h1 className="text-lg font-black text-white">Historial</h1>
            <p className="text-xs text-stone-500">
              {total} entrenos registrados
            </p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={() => exportCSV(sessions)}
              title="Exportar CSV"
              className="p-2 rounded-xl text-stone-400 hover:text-lime-400 hover:bg-white/10 transition-all"
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!loading && <StatsSummary stats={weekStats} total={total} unit={weightUnit} />}
        {!loading && sessions.length > 0 && <WeeklyChart sessions={sessions} />}
        {!loading && sessions.length > 0 && <ExerciseProgressChart unit={weightUnit} />}

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
                    ? (s?.bg ?? 'rgba(163,230,53,0.2)')
                    : 'rgba(255,255,255,0.04)',
                  color: active ? (s?.text ?? '#a5b4fc') : '#64748b',
                  border: active
                    ? `1px solid ${s?.border ?? 'rgba(163,230,53,0.35)'}`
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
                  <SessionCard key={s.id} session={s} unit={weightUnit} />
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
