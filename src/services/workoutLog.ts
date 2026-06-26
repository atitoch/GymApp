// src/services/workoutLog.ts  — versión corregida
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from '../utils/api';
import type {
  WorkoutLog,
  ExerciseLog,
  UpdateWorkoutLogRequest,
  CreateExerciseSetRequest,
} from '../types/workoutLog';

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT LOG ACTIVO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene o crea el workout log activo del día actual.
 * El backend maneja la lógica de crear si no existe.
 */
export const getOrCreateWorkoutLog = async (
  dayRoutineId?: string,
  routineId?: string,
): Promise<WorkoutLog> => {
  return authenticatedPost<WorkoutLog>('/workout-logs/current', {
    day_routine_id: dayRoutineId ?? null,
    routine_id: routineId ?? null,
  });
};

/**
 * Obtiene el workout log de una fecha específica SIN crearlo si no existe.
 * Usado para ver el registro de días pasados (solo lectura).
 * Devuelve null si el usuario no entrenó ese día.
 */
export const getWorkoutLogByDate = async (
  date: string,
): Promise<WorkoutLog | null> => {
  try {
    return await authenticatedGet<WorkoutLog>(
      `/workout-logs/by-date?date=${encodeURIComponent(date)}`,
    );
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 404) return null;
    throw error;
  }
};

/**
 * Actualiza el workout log (completar, rating, notas)
 */
export const updateWorkoutLog = async (
  logId: string,
  data: UpdateWorkoutLogRequest,
): Promise<WorkoutLog> => {
  return authenticatedPut<WorkoutLog>(`/workout-logs/${logId}`, data);
};

/**
 * Marca el workout como completado y opcionalmente agrega rating y notas
 */
export const completeWorkoutLog = async (
  logId: string,
  rating?: number,
  notes?: string,
  energyLevel?: number,
): Promise<WorkoutLog> => {
  return authenticatedPut<WorkoutLog>(`/workout-logs/${logId}`, {
    completed_at: new Date().toISOString(),
    rating,
    notes,
    energy_level: energyLevel,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE LOGS (SETS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un set de un ejercicio en el workout activo
 */
export const logExerciseSet = async (
  workoutLogId: string,
  data: CreateExerciseSetRequest,
): Promise<ExerciseLog> => {
  return authenticatedPost<ExerciseLog>(
    `/workout-logs/${workoutLogId}/exercise-logs`,
    data,
  );
};

/**
 * Obtiene todos los sets registrados de un workout
 */
export const getWorkoutExerciseLogs = async (
  workoutLogId: string,
): Promise<ExerciseLog[]> => {
  return authenticatedGet<ExerciseLog[]>(
    `/workout-logs/${workoutLogId}/exercise-logs`,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Historial paginado del usuario
 */
export const getWorkoutHistory = async (
  options: {
    limit?: number;
    offset?: number;
    dayName?: string;
    from?: string;
    to?: string;
  } = {},
): Promise<{ sessions: WorkoutLog[]; total: number }> => {
  const params = new URLSearchParams();
  if (options.limit != null) params.set('limit', String(options.limit));
  if (options.offset != null) params.set('offset', String(options.offset));
  if (options.dayName) params.set('day_name', options.dayName);
  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);

  const qs = params.toString();
  return authenticatedGet<{ sessions: WorkoutLog[]; total: number }>(
    `/workout-logs${qs ? `?${qs}` : ''}`,
  );
};

/**
 * Stats de la semana actual (para el Dashboard)
 */
export const getWeeklyStats = async (): Promise<{
  total_sessions: number;
  completed_sessions: number;
  days_trained: number;
  total_duration_min: number;
  total_volume: number;
  avg_rating: number | null;
  current_streak: number;
}> => {
  return authenticatedGet('/workout-logs/weekly-stats');
};

/**
 * Historial de un ejercicio específico — últimas N sesiones
 * Usado por ExerciseTracker para mostrar "última vez: 80kg × 10"
 */
export const getExerciseHistory = async (
  exerciseName: string,
  limit: number = 5,
): Promise<{ date: string; sets: ExerciseLog[] }[]> => {
  return authenticatedGet<{ date: string; sets: ExerciseLog[] }[]>(
    `/workout-logs/exercise-history/${encodeURIComponent(exerciseName)}?limit=${limit}`,
  );
};
