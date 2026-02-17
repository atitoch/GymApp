import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPatch,
} from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkoutSession {
  id: string;
  user_id: string;
  day_index: number;
  day_name: string;
  date: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_exercises: number;
  completed_exercises: number;
  notes?: string;
  created_at: string;
}

export interface CreateWorkoutSessionData {
  day_index: number;
  day_name: string;
  date: string;
  total_exercises: number;
}

export interface UpdateWorkoutSessionData {
  completed_exercises?: number;
  completed_at?: string;
  duration_seconds?: number;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  set_number: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  notes?: string;
  created_at: string;
}

export interface CreateExerciseLogData {
  session_id: string;
  exercise_name: string;
  set_number: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  notes?: string;
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

/**
 * Crear una nueva sesión de entrenamiento
 */
export const createWorkoutSession = async (
  data: CreateWorkoutSessionData,
): Promise<WorkoutSession> => {
  return await authenticatedPost<WorkoutSession>(`/workouts/sessions`, data);
};

/**
 * Actualizar sesión de entrenamiento
 */
export const updateWorkoutSession = async (
  sessionId: string,
  data: UpdateWorkoutSessionData,
): Promise<WorkoutSession> => {
  return await authenticatedPatch<WorkoutSession>(
    `/workouts/sessions/${sessionId}`,
    data,
  );
};

/**
 * Obtener historial de sesiones
 */
export const getWorkoutHistory = async (
  limit = 30,
): Promise<WorkoutSession[]> => {
  return await authenticatedGet<WorkoutSession[]>(
    `/workouts/sessions?limit=${limit}`,
  );
};

/**
 * Obtener sesión específica
 */
export const getWorkoutSession = async (
  sessionId: string,
): Promise<WorkoutSession | null> => {
  try {
    return await authenticatedGet<WorkoutSession>(
      `/workouts/sessions/${sessionId}`,
    );
  } catch {
    return null;
  }
};

// ─── Exercise Logs ────────────────────────────────────────────────────────────

/**
 * Crear log de ejercicio
 */
export const createExerciseLog = async (
  data: CreateExerciseLogData,
): Promise<ExerciseLog> => {
  return await authenticatedPost<ExerciseLog>(`/workouts/logs`, data);
};

/**
 * Obtener logs de una sesión
 */
export const getSessionLogs = async (
  sessionId: string,
): Promise<ExerciseLog[]> => {
  return await authenticatedGet<ExerciseLog[]>(
    `/workouts/sessions/${sessionId}/logs`,
  );
};
