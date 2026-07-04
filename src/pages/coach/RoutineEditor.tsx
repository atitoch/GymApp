import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Moon, ArrowUp, ArrowDown, Info } from 'lucide-react';
import {
  createRoutineTemplate,
  updateRoutineTemplate,
  getRoutineTemplate,
  type DayRoutineInput,
  type ExerciseInput,
  type SectionInput,
} from '../../services/coachDashboard';
import { authenticatedGet } from '../../utils/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const emptyExercise = (): ExerciseInput => ({ name: '', sets: '3', reps: '10', rpe: '7', rest: '60s', notes: '' });
const emptySection = (): SectionInput => ({ title: '', exercises: [emptyExercise()] });
const emptyDay = (): DayRoutineInput => ({ dayName: 'DÍA', title: 'Entrenamiento', warmup: [], sections: [emptySection()], cooldown: [] });
const restDay = (): DayRoutineInput => ({ dayName: 'DESCANSO', title: 'Descanso', warmup: [], sections: [], cooldown: [] });
const isRestDay = (d: DayRoutineInput) => d.dayName.toLowerCase().includes('descanso') || d.dayName.toLowerCase().includes('rest');

// ── Sub-components ────────────────────────────────────────────────────────────

function ExerciseRow({
  ex,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  ex: ExerciseInput;
  onChange: (updated: ExerciseInput) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; equipment: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rpeHint, setRpeHint] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = (val: string) => {
    onChange({ ...ex, name: val, exercise_catalog_id: null });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await authenticatedGet<{ id: string; name: string; equipment: string }[]>(
            `exercises/catalog/search?q=${encodeURIComponent(val)}&limit=5`,
          );
          setSuggestions(data ?? []);
          setShowSuggestions((data ?? []).length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s: { id: string; name: string }) => {
    onChange({ ...ex, name: s.name, exercise_catalog_id: s.id });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const smallField = (key: keyof ExerciseInput, placeholder?: string) => (
    <input
      value={ex[key] ?? ''}
      onChange={(e) => onChange({ ...ex, [key]: e.target.value })}
      placeholder={placeholder}
      className="w-full min-w-0 bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-lime-400 placeholder-stone-600"
    />
  );

  return (
    <div className="border border-stone-700 rounded-xl p-3 bg-stone-900/50 space-y-2.5">
      {/* Name row */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5 pt-1.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowUp size={11} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowDown size={11} />
          </button>
        </div>

        <div ref={wrapperRef} className="relative flex-1 min-w-0">
          <input
            value={ex.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false); }}
            placeholder="Nombre del ejercicio"
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-30 mt-0.5 bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                  className="w-full text-left px-3 py-2 text-sm text-stone-200 hover:bg-lime-400/10 hover:text-lime-300 transition-colors"
                >
                  <span>{s.name}</span>
                  {s.equipment && (
                    <span className="ml-2 text-xs text-stone-500">{s.equipment}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onRemove} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors shrink-0 pt-1.5">
          <Trash2 size={13} />
        </button>
      </div>

      {/* 2×2 fields */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-stone-500 mb-1 uppercase tracking-wider">Series</p>
          {smallField('sets')}
        </div>
        <div>
          <p className="text-[10px] text-stone-500 mb-1 uppercase tracking-wider">Reps</p>
          {smallField('reps')}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider">RPE</p>
            <button
              type="button"
              onClick={() => setRpeHint((v) => !v)}
              className="text-stone-600 hover:text-stone-400 transition-colors"
              title="¿Qué es RPE?"
            >
              <Info size={10} />
            </button>
          </div>
          {rpeHint && (
            <p className="text-[10px] text-stone-500 mb-1 leading-snug">
              Esfuerzo 1–10: 7 = moderado · 8 = difícil · 10 = fallo
            </p>
          )}
          {smallField('rpe', '1–10')}
        </div>
        <div>
          <p className="text-[10px] text-stone-500 mb-1 uppercase tracking-wider">Descanso</p>
          {smallField('rest', 'Ej. 60s, 2min')}
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="text-[10px] text-stone-500 mb-1 uppercase tracking-wider">Notas</p>
        <input
          value={ex.notes ?? ''}
          onChange={(e) => onChange({ ...ex, notes: e.target.value })}
          placeholder="Técnica, variación, indicaciones..."
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
        />
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: SectionInput;
  onChange: (s: SectionInput) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const updateExercise = (i: number, ex: ExerciseInput) => {
    const exercises = section.exercises.map((e, idx) => idx === i ? ex : e);
    onChange({ ...section, exercises });
  };
  const removeExercise = (i: number) => {
    onChange({ ...section, exercises: section.exercises.filter((_, idx) => idx !== i) });
  };
  const moveExercise = (i: number, dir: -1 | 1) => {
    const exercises = [...section.exercises];
    const j = i + dir;
    if (j < 0 || j >= exercises.length) return;
    [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
    onChange({ ...section, exercises });
  };
  const addExercise = () => onChange({ ...section, exercises: [...section.exercises, emptyExercise()] });

  return (
    <div className="border border-stone-700 rounded-2xl p-4 space-y-3 bg-stone-900/30">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowUp size={11} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowDown size={11} />
          </button>
        </div>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Bloque A · Circuito · Superset..."
          className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-lime-400 placeholder-stone-600"
        />
        <button onClick={onRemove} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="space-y-2">
        {section.exercises.map((ex, i) => (
          <ExerciseRow
            key={i}
            ex={ex}
            onChange={(e) => updateExercise(i, e)}
            onRemove={() => removeExercise(i)}
            onMoveUp={() => moveExercise(i, -1)}
            onMoveDown={() => moveExercise(i, 1)}
            isFirst={i === 0}
            isLast={i === section.exercises.length - 1}
          />
        ))}
        <button
          onClick={addExercise}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-700 text-sm font-medium text-stone-500 hover:text-lime-400 hover:border-lime-400/40 hover:bg-lime-400/5 active:scale-[0.98] transition-all"
        >
          <Plus size={14} /> Agregar ejercicio
        </button>
      </div>
    </div>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, val: string) => onChange(items.map((v, idx) => idx === i ? val : v));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">{label}</p>
        <button onClick={add} className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-lime-400 transition-colors">
          <Plus size={11} /> Agregar
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-stone-700 italic">Sin {label.toLowerCase()} — opcional</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
          />
          <button onClick={() => remove(i)} className="text-stone-600 hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function DayEditor({
  day,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isNew,
}: {
  day: DayRoutineInput;
  index: number;
  total: number;
  onChange: (d: DayRoutineInput) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isNew?: boolean;
}) {
  const [open, setOpen] = useState(index === 0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateSection = (i: number, s: SectionInput) => {
    const sections = day.sections.map((sec, idx) => idx === i ? s : sec);
    onChange({ ...day, sections });
  };
  const removeSection = (i: number) => onChange({ ...day, sections: day.sections.filter((_, idx) => idx !== i) });
  const moveSection = (i: number, dir: -1 | 1) => {
    const sections = [...day.sections];
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    [sections[i], sections[j]] = [sections[j], sections[i]];
    onChange({ ...day, sections });
  };
  const addSection = () => onChange({ ...day, sections: [...day.sections, emptySection()] });

  return (
    <div
      className="border rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: isNew ? 'rgba(163,230,53,0.5)' : 'rgba(68,64,60,1)',
        boxShadow: isNew ? '0 0 0 2px rgba(163,230,53,0.15)' : undefined,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-3 bg-stone-900 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 shrink-0 mr-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowUp size={12} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-0.5 rounded text-stone-600 hover:text-stone-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ArrowDown size={12} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-bold text-stone-500 shrink-0">Día {index + 1}</span>
          {isRestDay(day) && <Moon size={13} className="text-sky-400 shrink-0" />}
          <input
            value={day.dayName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...day, dayName: e.target.value })}
            placeholder="PUSH / PULL / DESCANSO..."
            className="bg-transparent border-b border-stone-700 text-sm font-bold text-white focus:outline-none focus:border-lime-400 w-28 min-w-0"
          />
          <input
            value={day.title}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...day, title: e.target.value })}
            placeholder="Título"
            className="bg-transparent border-b border-stone-700 text-sm text-stone-300 focus:outline-none focus:border-lime-400 flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setOpen(false); }}
            className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
        </div>
      </div>

      {confirmDelete && (
        <div className="px-4 py-3 bg-red-950/40 border-t border-red-400/20 flex items-center justify-between gap-3">
          <p className="text-sm text-red-300 flex-1">
            ¿Eliminar <strong className="text-white">Día {index + 1}</strong>
            {day.dayName ? ` — ${day.dayName}` : ''}?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onRemove}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {open && isRestDay(day) && (
        <div className="p-4 bg-stone-950/50 flex items-center gap-3 text-sm text-stone-400">
          <Moon size={16} className="text-sky-400 shrink-0" />
          Día de descanso — sin ejercicios. Cambia el nombre del día si quieres convertirlo en entrenamiento.
        </div>
      )}

      {open && !isRestDay(day) && (
        <div className="p-4 space-y-4 bg-stone-950/50">
          <StringListEditor
            label="Calentamiento"
            items={day.warmup ?? []}
            onChange={(warmup) => onChange({ ...day, warmup })}
            placeholder="Ej. 5 min bicicleta estática"
          />

          {day.sections.map((s, i) => (
            <SectionBlock
              key={i}
              section={s}
              onChange={(upd) => updateSection(i, upd)}
              onRemove={() => removeSection(i)}
              onMoveUp={() => moveSection(i, -1)}
              onMoveDown={() => moveSection(i, 1)}
              isFirst={i === 0}
              isLast={i === day.sections.length - 1}
            />
          ))}
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-lime-400 transition-colors"
          >
            <Plus size={12} /> Agregar sección
          </button>

          <StringListEditor
            label="Enfriamiento"
            items={day.cooldown ?? []}
            onChange={(cooldown) => onChange({ ...day, cooldown })}
            placeholder="Ej. Estiramiento de cuádriceps 30s"
          />
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const RoutineEditor: React.FC = () => {
  const { routineId } = useParams<{ routineId?: string }>();
  const navigate = useNavigate();
  const isNew = !routineId || routineId === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCyclic, setIsCyclic] = useState(true);
  const [days, setDays] = useState<DayRoutineInput[]>([emptyDay()]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDayIndex, setNewDayIndex] = useState<number | null>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isNew) return;
    getRoutineTemplate(routineId!)
      .then((t) => {
        setName(t.name);
        setDescription(t.description ?? '');
        setIsCyclic(t.isCyclic);
        setDays(t.routines.length > 0 ? t.routines : [emptyDay()]);
      })
      .catch(() => setError('No se pudo cargar la rutina.'))
      .finally(() => setLoading(false));
  }, [routineId, isNew]);

  const updateDay = useCallback((i: number, d: DayRoutineInput) => {
    setDays((prev) => prev.map((day, idx) => idx === i ? d : day));
  }, []);

  const removeDay = useCallback((i: number) => {
    setDays((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const moveDay = useCallback((i: number, dir: -1 | 1) => {
    setDays((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const addDay = (factory: () => DayRoutineInput) => {
    setDays((prev) => {
      const next = [...prev, factory()];
      const idx = next.length - 1;
      setTimeout(() => {
        dayRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setNewDayIndex(idx);
        setTimeout(() => setNewDayIndex(null), 1200);
      }, 50);
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es requerido.'); return; }
    if (days.length === 0) { setError('Agrega al menos un día.'); return; }

    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        isCyclic,
        pattern: days.map((d) => d.dayName),
        routines: days,
      };

      if (isNew) {
        await createRoutineTemplate(payload);
      } else {
        await updateRoutineTemplate(routineId!, payload);
      }
      navigate('/coach/routines');
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 size={28} className="text-lime-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-32">
      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/coach/routines')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-black flex-1">{isNew ? 'Nueva rutina' : 'Editar rutina'}</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Metadata */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Rutina Push/Pull/Legs"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve (opcional)"
              rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 resize-none focus:outline-none focus:border-lime-400"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsCyclic((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isCyclic ? 'bg-lime-400' : 'bg-stone-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isCyclic ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-stone-300">Rutina cíclica</span>
            <span className="text-xs text-stone-500">{isCyclic ? 'Se repite al terminar' : 'Se detiene al final'}</span>
          </label>
        </div>

        {/* Days */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Días ({days.length})</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => addDay(restDay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-sky-400 hover:bg-sky-400/10 active:scale-95 transition-all"
              >
                <Moon size={13} /> Agregar descanso
              </button>
              <button
                onClick={() => addDay(emptyDay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-lime-400 hover:bg-lime-400/10 active:scale-95 transition-all"
              >
                <Plus size={13} /> Agregar día
              </button>
            </div>
          </div>
          {days.map((day, i) => (
            <div key={i} ref={(el) => { dayRefs.current[i] = el; }}>
              <DayEditor
                day={day}
                index={i}
                total={days.length}
                onChange={(d) => updateDay(i, d)}
                onRemove={() => removeDay(i)}
                onMoveUp={() => moveDay(i, -1)}
                onMoveDown={() => moveDay(i, 1)}
                isNew={newDayIndex === i}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
