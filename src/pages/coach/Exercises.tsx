import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, Check, X, Loader2, Dumbbell, Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import {
  getMyExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  type CustomExercise,
  type CustomExerciseInput,
} from '../../services/exerciseCatalog';
import { BASE_CATALOG, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER, type MuscleGroup } from '../../data/baseCatalog';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  pecho:    'bg-blue-400/10 text-blue-400 border-blue-400/20',
  espalda:  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  hombros:  'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  biceps:   'bg-pink-400/10 text-pink-400 border-pink-400/20',
  triceps:  'bg-orange-400/10 text-orange-400 border-orange-400/20',
  piernas:  'bg-green-400/10 text-green-400 border-green-400/20',
  gluteos:  'bg-rose-400/10 text-rose-400 border-rose-400/20',
  abdomen:  'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  cardio:   'bg-red-400/10 text-red-400 border-red-400/20',
  otro:     'bg-stone-700/50 text-stone-400 border-stone-600',
};

const emptyInput = (): CustomExerciseInput => ({
  name: '',
  muscle_group: 'otro',
  instructions: '',
  is_active: true,
});

// ── Sub-components ────────────────────────────────────────────────────────────

function MuscleChip({ group }: { group: MuscleGroup }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${MUSCLE_COLORS[group]}`}>
      {MUSCLE_GROUP_LABELS[group]}
    </span>
  );
}

interface ExerciseFormProps {
  initial?: CustomExerciseInput;
  onSave: (data: CustomExerciseInput) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function ExerciseForm({ initial, onSave, onCancel, saving }: ExerciseFormProps) {
  const [form, setForm] = useState<CustomExerciseInput>(initial ?? emptyInput());
  const f = <K extends keyof CustomExerciseInput>(k: K, v: CustomExerciseInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="bg-stone-900 border border-lime-400/30 rounded-2xl p-4 space-y-3">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nombre *</label>
        <input
          value={form.name}
          onChange={(e) => f('name', e.target.value)}
          placeholder="Ej. Leg Press Cybex 200"
          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Grupo muscular *</label>
        <select
          value={form.muscle_group}
          onChange={(e) => f('muscle_group', e.target.value as MuscleGroup)}
          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
        >
          {MUSCLE_GROUP_ORDER.map((g) => (
            <option key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Instrucciones / cómo ejecutarlo
        </label>
        <textarea
          value={form.instructions ?? ''}
          onChange={(e) => f('instructions', e.target.value)}
          placeholder="Descripción de la ejecución, ajustes de máquina, puntos de atención..."
          rows={3}
          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 resize-none focus:outline-none focus:border-lime-400"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-stone-400 hover:text-white hover:bg-white/10 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Guardar
        </button>
      </div>
    </div>
  );
}

// ── Base catalog viewer ───────────────────────────────────────────────────────

function BaseCatalogSection({ search }: { search: string }) {
  const [openGroup, setOpenGroup] = useState<MuscleGroup | null>(null);

  const filtered = BASE_CATALOG.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase())
  );

  const byGroup = MUSCLE_GROUP_ORDER.map((g) => ({
    group: g,
    exercises: filtered.filter((e) => e.muscleGroup === g),
  })).filter((g) => g.exercises.length > 0);

  if (byGroup.length === 0) return (
    <p className="text-sm text-stone-600 text-center py-4">Sin resultados en el catálogo base.</p>
  );

  return (
    <div className="space-y-2">
      {byGroup.map(({ group, exercises }) => {
        const isOpen = openGroup === group || !!search;
        return (
          <div key={group} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenGroup(isOpen && !search ? null : group)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <MuscleChip group={group} />
                <span className="text-xs text-stone-500">{exercises.length} ejercicios</span>
              </div>
              {!search && (isOpen ? <ChevronUp size={14} className="text-stone-600" /> : <ChevronDown size={14} className="text-stone-600" />)}
            </button>
            {isOpen && (
              <div className="border-t border-stone-800 divide-y divide-stone-800/60">
                {exercises.map((ex) => (
                  <div key={ex.name} className="px-4 py-2.5">
                    <p className="text-sm text-stone-200 font-medium">{ex.name}</p>
                    {ex.instructions && (
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{ex.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

type TabId = 'custom' | 'base';

export const CoachExercises: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('custom');
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    getMyExercises()
      .then(setExercises)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: CustomExerciseInput) => {
    setSaving(true);
    try {
      const ex = await createExercise(data);
      setExercises((prev) => [ex, ...prev]);
      setShowForm(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: CustomExerciseInput) => {
    setSaving(true);
    try {
      const ex = await updateExercise(id, data);
      setExercises((prev) => prev.map((e) => e.id === id ? ex : e));
      setEditingId(null);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
      setConfirmDeleteId(null);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  const filtered = exercises.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
    MUSCLE_GROUP_LABELS[e.muscle_group].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <Dumbbell size={18} className="text-lime-400 shrink-0" />
          <h1 className="text-base font-black flex-1">Catálogo de ejercicios</h1>
          {tab === 'custom' && !showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              <Plus size={15} /> Nuevo
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          {([['custom', 'Mis ejercicios'], ['base', 'Catálogo base']] as [TabId, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === id
                  ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {id === 'base' && <BookOpen size={11} />}
              {label}
              {id === 'custom' && !loading && (
                <span className="text-stone-600 font-normal">{exercises.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={14} className="text-stone-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="flex-1 bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-stone-600 hover:text-stone-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* New exercise form */}
        {tab === 'custom' && showForm && (
          <ExerciseForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}

        {/* Custom exercises tab */}
        {tab === 'custom' && (
          <>
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="text-lime-400 animate-spin" />
              </div>
            )}

            {!loading && filtered.length === 0 && !showForm && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
                <Dumbbell size={32} className="text-stone-600 mx-auto mb-3" />
                <p className="font-bold text-white">
                  {exercises.length === 0 ? 'Sin ejercicios propios aún' : 'Sin resultados'}
                </p>
                <p className="text-sm mt-1">
                  {exercises.length === 0
                    ? 'Agrega ejercicios específicos de tu gimnasio o equipo.'
                    : 'Prueba con otro término.'}
                </p>
                {exercises.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                  >
                    Agregar primer ejercicio
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              {filtered.map((ex) => (
                <div key={ex.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                  {editingId === ex.id ? (
                    <div className="p-4">
                      <ExerciseForm
                        initial={{ name: ex.name, muscle_group: ex.muscle_group, instructions: ex.instructions ?? '', is_active: ex.is_active }}
                        onSave={(data) => handleUpdate(ex.id, data)}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-white text-sm">{ex.name}</p>
                            <MuscleChip group={ex.muscle_group} />
                          </div>
                          {ex.instructions && (
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{ex.instructions}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingId(ex.id); setShowForm(false); }}
                            className="p-1.5 text-stone-500 hover:text-lime-400 transition-colors rounded-lg"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(ex.id)}
                            className="p-1.5 text-stone-500 hover:text-red-400 transition-colors rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {confirmDeleteId === ex.id && (
                        <div className="px-4 py-3 bg-red-950/40 border-t border-red-400/20 flex items-center justify-between gap-3">
                          <p className="text-sm text-red-300 flex-1">¿Eliminar <strong className="text-white">{ex.name}</strong>?</p>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDelete(ex.id)}
                              disabled={deletingId === ex.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50"
                            >
                              {deletingId === ex.id ? <Loader2 size={12} className="animate-spin" /> : 'Eliminar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Base catalog tab */}
        {tab === 'base' && <BaseCatalogSection search={search} />}
      </div>
    </div>
  );
};
