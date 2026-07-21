// src/services/syncQueue.ts
//
// Cola de sets de ejercicio pendientes de sincronizar. Cuando guardar un set
// falla por falta de conexión, se encola aquí (persistido en localStorage
// para sobrevivir un refresh/cierre de la app) con un ID temporal, y se
// reintenta cuando vuelve la conexión. Un error que no es de red (ej. el
// backend rechaza el payload) se descarta de la cola: reintentarlo nunca
// va a funcionar y no queremos bloquear el resto de la sincronización.
import type { CreateExerciseSetRequest, ExerciseLog } from '../types/workoutLog';
import { isNetworkError } from '../utils/errorHandler';

const STORAGE_KEY = 'gymapp_pending_exercise_sets';
// F4 fix: discard queued sets older than 24h — after that the workout log is
// almost certainly completed or the session is stale, and retrying will always fail.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface QueuedSet {
  tempId: string;
  workoutLogId: string;
  payload: CreateExerciseSetRequest;
  createdAt: number;
}

function readQueue(): QueuedSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // F4 fix: evict stale items so they don't accumulate indefinitely
    const now = Date.now();
    const fresh = parsed.filter((item: QueuedSet) => now - item.createdAt < MAX_AGE_MS);
    if (fresh.length !== parsed.length) writeQueue(fresh);
    return fresh;
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage lleno o no disponible: el set queda solo en memoria,
    // no sobrevive un refresh, pero no rompe la sesión actual.
  }
}

export function getQueuedSets(): QueuedSet[] {
  return readQueue();
}

export function enqueueSet(
  workoutLogId: string,
  payload: CreateExerciseSetRequest,
): QueuedSet {
  const queue = readQueue();
  const item: QueuedSet = {
    tempId: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    workoutLogId,
    payload,
    createdAt: Date.now(),
  };
  queue.push(item);
  writeQueue(queue);
  return item;
}

/** Log optimista para reflejar en la UI un set encolado antes de sincronizar. */
export function toOptimisticLog(item: QueuedSet): ExerciseLog {
  return {
    id: item.tempId,
    workout_log_id: item.workoutLogId,
    exercise_name: item.payload.exercise_name,
    set_number: item.payload.set_number,
    reps_completed: item.payload.reps_completed ?? null,
    weight_kg: item.payload.weight_kg ?? null,
    weight_lbs: item.payload.weight_lbs ?? null,
    rpe_actual: item.payload.rpe_actual ?? null,
    notes: item.payload.notes ?? null,
  } as ExerciseLog;
}

export interface FlushResult {
  synced: { tempId: string; log: ExerciseLog }[];
  dropped: QueuedSet[];
}

/**
 * Intenta sincronizar cada set pendiente, en el orden en que se crearon.
 * - Si falla por red: se mantiene en la cola para el próximo intento.
 * - Si falla por otra razón (validación, log no encontrado, etc.): se
 *   descarta, porque reintentar no va a cambiar el resultado.
 */
// Evita flushes concurrentes: el consumidor llama al montar Y en el evento
// 'online', y si ambos corren a la vez cada uno sincronizaría la misma cola
// completa, duplicando los sets en el backend.
let _flushing = false;

export async function flushQueue(
  syncFn: (
    workoutLogId: string,
    payload: CreateExerciseSetRequest,
  ) => Promise<ExerciseLog>,
): Promise<FlushResult> {
  if (_flushing) return { synced: [], dropped: [] };
  _flushing = true;
  try {
    const queue = readQueue();
    if (queue.length === 0) return { synced: [], dropped: [] };

    const synced: FlushResult['synced'] = [];
    const dropped: QueuedSet[] = [];
    const remaining: QueuedSet[] = [];

    for (const item of queue) {
      try {
        const log = await syncFn(item.workoutLogId, item.payload);
        synced.push({ tempId: item.tempId, log });
      } catch (error) {
        if (isNetworkError(error)) {
          remaining.push(item);
        } else {
          dropped.push(item);
        }
      }
    }

    writeQueue(remaining);
    return { synced, dropped };
  } finally {
    _flushing = false;
  }
}

export function clearQueue(): void {
  writeQueue([]);
}
