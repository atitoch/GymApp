import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import { Check, ChevronDown, ChevronUp, Clock, TrendingUp } from 'lucide-react';
import type {
  ExerciseLog,
  CreateExerciseSetRequest,
} from '../types/workoutLog';
import { getExerciseHistory } from '../services/workoutLog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  name: string;
  sets: string; // "4" o "3-4"
  reps: string; // "8-10"
  rpe: string;
  rest: string;
  notes?: string;
}

interface ExerciseTrackerProps {
  exercise: Exercise;
  workoutLogId: string | null;
  /** Sets ya guardados (del estado global de dayRoutine) */
  completedSets: ExerciseLog[];
  /** Callback para guardar un set — maneja backend + localStorage */
  onLogSet: (
    exerciseName: string,
    data: Omit<CreateExerciseSetRequest, 'exercise_name' | 'set_number'>,
  ) => Promise<void>;
  /** true si el día es el actual y se puede registrar */
  isCurrentDay: boolean;
  /** true si falló la inicialización del workout log */
  workoutLogError?: boolean;
  weightUnit?: 'kg' | 'lbs';
  /** true si es un día pasado con series ya registradas — muestra el registro en solo lectura */
  viewOnly?: boolean;
}

interface SetRow {
  setIndex: number; // 0-based
  weight: string;
  reps: string;
  saved: boolean;
  saving: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTargetSets(sets: string): number {
  const n = parseInt(sets.split('-')[0]);
  return isNaN(n) ? 3 : n;
}

function parseTargetReps(reps: string): string {
  // Devuelve el valor por defecto para el input (el mínimo del rango)
  const match = reps.match(/^(\d+)/);
  return match ? match[1] : '';
}

// ─── Last Session Badge ───────────────────────────────────────────────────────

function LastSessionBadge({
  exerciseName,
  weightUnit = 'kg',
}: {
  exerciseName: string;
  weightUnit?: string;
}) {
  const [lastSession, setLastSession] = useState<{
    weight: number;
    reps: number;
  } | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    getExerciseHistory(exerciseName, 1)
      .then((history) => {
        if (!history?.length) return;
        const lastSets = history[0].sets;
        if (!lastSets?.length) return;

        const getWeight = (s: (typeof lastSets)[number]) =>
          (weightUnit === 'lbs' ? s.weight_lbs : s.weight_kg) ?? 0;

        // Buscar el set con mayor peso
        const best = lastSets.reduce((acc, s) =>
          getWeight(s) > getWeight(acc) ? s : acc,
        );

        const bestWeight = getWeight(best);
        if (bestWeight) {
          setLastSession({
            weight: bestWeight,
            reps: best.reps_completed ?? 0,
          });
        }
      })
      .catch(() => {}); // silencioso si no hay historial
  }, [exerciseName]);

  if (!lastSession) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: '#34d399',
      }}
    >
      <TrendingUp size={10} />
      Última: {lastSession.weight}
      {weightUnit} × {lastSession.reps}
    </span>
  );
}

// ─── SetRow Component ─────────────────────────────────────────────────────────

function SetRowItem({
  row,
  setNumber,
  targetReps,
  weightUnit,
  isCurrentDay,
  onWeightChange,
  onRepsChange,
  onSave,
}: {
  row: SetRow;
  setNumber: number;
  targetReps: string;
  weightUnit: string;
  isCurrentDay: boolean;
  onWeightChange: (val: string) => void;
  onRepsChange: (val: string) => void;
  onSave: () => void;
}) {
  const canSave = row.weight.trim() !== '' && row.reps.trim() !== '';

  return (
    <div
      className="flex items-center gap-2 py-2 px-1 rounded-xl transition-all"
      style={{
        background: row.saved
          ? 'rgba(16,185,129,0.07)'
          : 'rgba(255,255,255,0.02)',
        opacity: !isCurrentDay ? 0.5 : 1,
      }}
    >
      {/* Set number */}
      <span
        className="text-xs font-black tabular-nums w-6 text-center shrink-0"
        style={{ color: row.saved ? '#34d399' : '#475569' }}
      >
        {setNumber}
      </span>

      {/* Weight input */}
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          inputMode="decimal"
          value={row.weight}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="—"
          disabled={row.saved || !isCurrentDay}
          min={0}
          step={0.5}
          className="w-full rounded-lg px-2 py-1.5 text-sm font-semibold text-center tabular-nums outline-none transition-all"
          style={{
            background: row.saved ? 'transparent' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${row.saved ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
            color: row.saved ? '#34d399' : 'white',
          }}
        />
        <span className="text-xs text-stone-600 shrink-0">{weightUnit}</span>
      </div>

      {/* Reps input */}
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={row.reps}
          onChange={(e) => onRepsChange(e.target.value)}
          placeholder={targetReps || '—'}
          disabled={row.saved || !isCurrentDay}
          min={0}
          step={1}
          className="w-full rounded-lg px-2 py-1.5 text-sm font-semibold text-center tabular-nums outline-none transition-all"
          style={{
            background: row.saved ? 'transparent' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${row.saved ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
            color: row.saved ? '#34d399' : 'white',
          }}
        />
        <span className="text-xs text-stone-600 shrink-0">reps</span>
      </div>

      {/* Save button */}
      {isCurrentDay && (
        <button
          onClick={onSave}
          disabled={row.saved || row.saving || !canSave}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{
            background: row.saved
              ? 'rgba(16,185,129,0.2)'
              : canSave
                ? 'linear-gradient(135deg,#a3e635,#84cc16)'
                : 'rgba(255,255,255,0.05)',
            opacity: !canSave && !row.saved ? 0.4 : 1,
            boxShadow:
              canSave && !row.saved
                ? '0 2px 12px rgba(163,230,53,0.35)'
                : 'none',
          }}
        >
          {row.saving ? (
            <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Check
              size={14}
              className={row.saved ? 'text-emerald-400' : 'text-white'}
            />
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExerciseTracker({
  exercise,
  workoutLogId,
  completedSets,
  onLogSet,
  isCurrentDay,
  workoutLogError = false,
  weightUnit = 'kg',
  viewOnly = false,
}: ExerciseTrackerProps) {
  const { toasts, showToast, hideToast } = useToast();
  const targetSets = parseTargetSets(exercise.sets);
  const targetReps = parseTargetReps(exercise.reps);
  const canExpand = isCurrentDay || viewOnly;

  // Inicializar filas: una por set planificado
  const initRows = useCallback((): SetRow[] => {
    return Array.from({ length: targetSets }, (_, i) => {
      const saved = completedSets[i];
      const savedWeight =
        weightUnit === 'lbs' ? saved?.weight_lbs : saved?.weight_kg;
      return {
        setIndex: i,
        weight: savedWeight?.toString() ?? '',
        reps: saved?.reps_completed?.toString() ?? '',
        saved: !!saved,
        saving: false,
      };
    });
  }, [targetSets, completedSets, weightUnit]);

  const [rows, setRows] = useState<SetRow[]>(initRows);
  const [expanded, setExpanded] = useState(canExpand);

  // Sincronizar cuando llegan completedSets desde el estado global
  useEffect(() => {
    setRows(initRows());
  }, [completedSets.length, initRows]);

  const updateRow = (index: number, patch: Partial<SetRow>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const handleSave = async (rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row || row.saved || row.saving) return;
    if (!row.weight.trim() || !row.reps.trim()) return;

    updateRow(rowIndex, { saving: true });

    const repsValue = parseInt(row.reps, 10);
    const weightValue = parseFloat(row.weight);

    if (isNaN(repsValue) || repsValue <= 0) {
      showToast('Ingresa un número de repeticiones válido', 'error');
      updateRow(rowIndex, { saving: false });
      return;
    }
    if (isNaN(weightValue) || weightValue < 0) {
      showToast('Ingresa un peso válido', 'error');
      updateRow(rowIndex, { saving: false });
      return;
    }

    try {
      await onLogSet(exercise.name, {
        reps_completed: repsValue,
        weight_kg: weightUnit === 'kg' ? weightValue : undefined,
        weight_lbs: weightUnit === 'lbs' ? weightValue : undefined,
      });
      updateRow(rowIndex, { saving: false, saved: true });
    } catch {
      updateRow(rowIndex, { saving: false });
      showToast('Error al guardar el set. Intenta de nuevo.', 'error');
    }
  };

  const completedCount = rows.filter((r) => r.saved).length;
  const allDone = targetSets > 0 && completedCount >= targetSets;

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => hideToast(t.id)} />
      ))}
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: allDone
          ? 'rgba(16,185,129,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${allDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Header */}
      <button
        className="w-full px-4 pt-3 pb-2 flex items-start justify-between gap-3 text-left"
        onClick={() => canExpand && setExpanded((e) => !e)}
        disabled={!canExpand}
        style={{ cursor: canExpand ? 'pointer' : 'default' }}
      >
        <div className="flex-1 min-w-0">
          {/* Exercise name */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white leading-tight">
              {exercise.name}
            </span>
            {allDone && (
              <span className="text-xs font-semibold text-emerald-400">
                ✓ Completado
              </span>
            )}
          </div>

          {/* Target + last session */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-stone-500">
              {exercise.sets} × {exercise.reps} reps
              {exercise.rpe && exercise.rpe !== '-' && ` · RPE ${exercise.rpe}`}
              {exercise.rest && exercise.rest !== '-' && (
                <span className="inline-flex items-center gap-0.5 ml-1">
                  <Clock size={9} className="text-stone-600" />
                  {exercise.rest}
                </span>
              )}
            </span>
            {isCurrentDay && (
              <LastSessionBadge
                exerciseName={exercise.name}
                weightUnit={weightUnit}
              />
            )}
          </div>

          {exercise.notes && (
            <p className="text-xs text-stone-600 mt-1 italic">
              {exercise.notes}
            </p>
          )}
        </div>

        {/* Progress pill + chevron */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span
            className="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
            style={{
              background: allDone
                ? 'rgba(16,185,129,0.15)'
                : completedCount > 0
                  ? 'rgba(163,230,53,0.15)'
                  : 'rgba(255,255,255,0.05)',
              color: allDone
                ? '#34d399'
                : completedCount > 0
                  ? '#a5b4fc'
                  : '#475569',
            }}
          >
            {completedCount}/{targetSets}
          </span>
          {canExpand &&
            (expanded ? (
              <ChevronUp size={14} className="text-stone-600" />
            ) : (
              <ChevronDown size={14} className="text-stone-600" />
            ))}
        </div>
      </button>

      {/* Rows - día actual (editable) o día pasado con registro (solo lectura) */}
      {expanded && canExpand && (
        <div className="px-3 pb-3">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-xs text-stone-700 w-6 text-center">#</span>
            <span className="text-xs text-stone-700 flex-1 text-center">
              Peso
            </span>
            <span className="text-xs text-stone-700 flex-1 text-center">
              Reps
            </span>
            {isCurrentDay && <span className="w-8" />}
          </div>

          <div className="space-y-1">
            {rows.map((row, i) => (
              <SetRowItem
                key={i}
                row={row}
                setNumber={i + 1}
                targetReps={targetReps}
                weightUnit={weightUnit}
                isCurrentDay={isCurrentDay}
                onWeightChange={(val) => updateRow(i, { weight: val })}
                onRepsChange={(val) => updateRow(i, { reps: val })}
                onSave={() => handleSave(i)}
              />
            ))}
          </div>

          {/* Estado del workout log */}
          {isCurrentDay && !workoutLogId && (
            <p className={`text-xs mt-2 text-center ${workoutLogError ? 'text-red-400' : 'text-stone-500'}`}>
              {workoutLogError
                ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
                : 'Iniciando sesión...'}
            </p>
          )}
        </div>
      )}
    </div>
    </>
  );
}
