import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Dumbbell } from 'lucide-react';
import { BASE_CATALOG, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER, type MuscleGroup } from '../data/baseCatalog';
import type { CustomExercise } from '../services/exerciseCatalog';

interface ExercisePickerProps {
  customExercises?: CustomExercise[];
  onSelect: (name: string) => void;
  onClose: () => void;
}

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

/**
 * Modal bottom sheet para seleccionar un ejercicio del catálogo base o
 * de los ejercicios personalizados del coach.
 */
export const ExercisePicker: React.FC<ExercisePickerProps> = ({ customExercises = [], onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all');

  const allExercises = useMemo(() => {
    const custom = customExercises.map((e) => ({
      name: e.name,
      muscleGroup: e.muscle_group,
      instructions: e.instructions ?? undefined,
      isCustom: true,
    }));
    const base = BASE_CATALOG.map((e) => ({ ...e, isCustom: false }));
    return [...custom, ...base];
  }, [customExercises]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allExercises.filter((e) => {
      const matchSearch = !q || e.name.toLowerCase().includes(q);
      const matchMuscle = muscleFilter === 'all' || e.muscleGroup === muscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [allExercises, search, muscleFilter]);

  const grouped = useMemo(() => {
    return MUSCLE_GROUP_ORDER.map((g) => ({
      group: g,
      exercises: filtered.filter((e) => e.muscleGroup === g),
    })).filter((g) => g.exercises.length > 0);
  }, [filtered]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="mt-auto rounded-t-3xl overflow-hidden flex flex-col"
        style={{ background: '#111110', maxHeight: '85dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-800">
          <Dumbbell size={16} className="text-lime-400 shrink-0" />
          <p className="font-bold text-white flex-1">Seleccionar ejercicio</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Search size={14} className="text-stone-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="flex-1 bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-stone-600 hover:text-stone-400">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Muscle filter chips */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMuscleFilter('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              muscleFilter === 'all'
                ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                : 'text-stone-500 border border-stone-700 hover:text-stone-300'
            }`}
          >
            Todos
          </button>
          {MUSCLE_GROUP_ORDER.map((g) => (
            <button
              key={g}
              onClick={() => setMuscleFilter(muscleFilter === g ? 'all' : g)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                muscleFilter === g ? MUSCLE_COLORS[g] : 'text-stone-500 border-stone-700 hover:text-stone-300'
              }`}
            >
              {MUSCLE_GROUP_LABELS[g]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-stone-600 py-8">Sin resultados.</p>
          )}

          {/* Custom exercises on top when no search */}
          {!search && muscleFilter === 'all' && customExercises.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-lime-400/60 flex items-center gap-1.5 py-1">
                <Dumbbell size={10} /> Mis ejercicios
              </p>
              {customExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelect(ex.name)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${MUSCLE_COLORS[ex.muscle_group]}`}>
                    {MUSCLE_GROUP_LABELS[ex.muscle_group]}
                  </span>
                  <span className="text-sm text-white">{ex.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Base catalog grouped */}
          {grouped.map(({ group, exercises }) => (
            <div key={group} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 flex items-center gap-1.5 py-1">
                <BookOpen size={10} /> {MUSCLE_GROUP_LABELS[group]}
              </p>
              {exercises.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => onSelect(ex.name)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <p className="text-sm text-stone-200">{ex.name}</p>
                  {ex.instructions && (
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed line-clamp-1">{ex.instructions}</p>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
