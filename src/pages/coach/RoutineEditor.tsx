import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  createRoutineTemplate,
  updateRoutineTemplate,
  getRoutineTemplate,
  type DayRoutineInput,
  type ExerciseInput,
  type SectionInput,
} from '../../services/coachDashboard';

// ── Helpers ──────────────────────────────────────────────────────────────────

const emptyExercise = (): ExerciseInput => ({ name: '', sets: '3', reps: '10', rpe: '7', rest: '60s', notes: '' });
const emptySection = (): SectionInput => ({ title: 'Serie', exercises: [emptyExercise()] });
const emptyDay = (): DayRoutineInput => ({ dayName: 'DÍA', title: 'Entrenamiento', warmup: [], sections: [emptySection()], cooldown: [] });

// ── Sub-components ────────────────────────────────────────────────────────────

function ExerciseRow({
  ex,
  onChange,
  onRemove,
}: {
  ex: ExerciseInput;
  onChange: (updated: ExerciseInput) => void;
  onRemove: () => void;
}) {
  const field = (key: keyof ExerciseInput) => (
    <input
      value={ex[key] ?? ''}
      onChange={(e) => onChange({ ...ex, [key]: e.target.value })}
      className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-lime-400"
    />
  );

  return (
    <div className="grid gap-1.5 border border-stone-700 rounded-xl p-3 bg-stone-900/50">
      <div className="flex items-center gap-2">
        <input
          value={ex.name}
          onChange={(e) => onChange({ ...ex, name: e.target.value })}
          placeholder="Nombre del ejercicio"
          className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-lime-400"
        />
        <button onClick={onRemove} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {(['sets', 'reps', 'rpe', 'rest'] as const).map((k) => (
          <div key={k}>
            <p className="text-[10px] text-stone-500 mb-0.5 uppercase tracking-wider">{k === 'rest' ? 'Descanso' : k.toUpperCase()}</p>
            {field(k)}
          </div>
        ))}
      </div>
      <input
        value={ex.notes ?? ''}
        onChange={(e) => onChange({ ...ex, notes: e.target.value })}
        placeholder="Notas (opcional)"
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
      />
    </div>
  );
}

function SectionBlock({
  section,
  onChange,
  onRemove,
}: {
  section: SectionInput;
  onChange: (s: SectionInput) => void;
  onRemove: () => void;
}) {
  const updateExercise = (i: number, ex: ExerciseInput) => {
    const exercises = section.exercises.map((e, idx) => idx === i ? ex : e);
    onChange({ ...section, exercises });
  };
  const removeExercise = (i: number) => {
    const exercises = section.exercises.filter((_, idx) => idx !== i);
    onChange({ ...section, exercises });
  };
  const addExercise = () => onChange({ ...section, exercises: [...section.exercises, emptyExercise()] });

  return (
    <div className="border border-stone-700 rounded-2xl p-4 space-y-3 bg-stone-900/30">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-stone-600 shrink-0" />
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Nombre de la sección"
          className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
        />
        <button onClick={onRemove} className="p-1.5 text-stone-500 hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="space-y-2 pl-5">
        {section.exercises.map((ex, i) => (
          <ExerciseRow key={i} ex={ex} onChange={(e) => updateExercise(i, e)} onRemove={() => removeExercise(i)} />
        ))}
        <button
          onClick={addExercise}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-lime-400 transition-colors"
        >
          <Plus size={12} /> Agregar ejercicio
        </button>
      </div>
    </div>
  );
}

function DayEditor({
  day,
  index,
  onChange,
  onRemove,
}: {
  day: DayRoutineInput;
  index: number;
  onChange: (d: DayRoutineInput) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);

  const updateSection = (i: number, s: SectionInput) => {
    const sections = day.sections.map((sec, idx) => idx === i ? s : sec);
    onChange({ ...day, sections });
  };
  const removeSection = (i: number) => onChange({ ...day, sections: day.sections.filter((_, idx) => idx !== i) });
  const addSection = () => onChange({ ...day, sections: [...day.sections, emptySection()] });

  return (
    <div className="border border-stone-700 rounded-2xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-stone-900 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold text-stone-500">Día {index + 1}</span>
          <input
            value={day.dayName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...day, dayName: e.target.value })}
            placeholder="PUSH / PULL / DESCANSO..."
            className="bg-transparent border-b border-stone-700 text-sm font-bold text-white focus:outline-none focus:border-lime-400 w-32"
          />
          <input
            value={day.title}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ ...day, title: e.target.value })}
            placeholder="Título del día"
            className="bg-transparent border-b border-stone-700 text-sm text-stone-300 focus:outline-none focus:border-lime-400 flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4 bg-stone-950/50">
          {/* Secciones */}
          {day.sections.map((s, i) => (
            <SectionBlock key={i} section={s} onChange={(upd) => updateSection(i, upd)} onRemove={() => removeSection(i)} />
          ))}
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-lime-400 transition-colors"
          >
            <Plus size={12} /> Agregar sección
          </button>
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Días ({days.length})</p>
            <button
              onClick={() => setDays((prev) => [...prev, emptyDay()])}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-lime-400 transition-colors"
            >
              <Plus size={13} /> Agregar día
            </button>
          </div>
          {days.map((day, i) => (
            <DayEditor
              key={i}
              day={day}
              index={i}
              onChange={(d) => updateDay(i, d)}
              onRemove={() => removeDay(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
