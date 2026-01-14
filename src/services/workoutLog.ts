import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from "../utils/api";
import type {
  WorkoutLog,
  WorkoutLogWithExercises,
  ExerciseLog,
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  CreateExerciseSetRequest,
} from "../types/workoutLog";

/**
 * Crea o obtiene el workout log activo para el día actual
 * Métodos HTTP: GET (para obtener) y POST (para crear)
 */
export const getOrCreateWorkoutLog = async (
  userId: string,
  dayRoutineId?: string,
  routineId?: string
): Promise<WorkoutLog> => {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Intentar obtener el workout log existente para hoy
    // GET /api/workout-logs/today
    const existingLog = await authenticatedPost<WorkoutLog>(
      `/api/workout-logs/today`,
      {
        user_id: userId,
        date: today,
      }
    );

    if (existingLog) {
      return existingLog;
    }
  } catch {
    // Si no existe, crear uno nuevo
    console.log("No existing workout log found, creating new one");
  }

  // Crear nuevo workout log
  // POST /api/workout-logs
  const request: CreateWorkoutLogRequest = {
    day_routine_id: dayRoutineId,
    routine_id: routineId,
    workout_date: today,
    started_at: new Date().toISOString(),
  };

  return authenticatedPost<WorkoutLog>("/api/workout-logs", request);
};

/**
 * Obtiene un workout log por ID con sus exercise logs
 * Método HTTP: GET /api/workout-logs/:id
 */
export const getWorkoutLog = async (
  logId: string
): Promise<WorkoutLogWithExercises> => {
  return authenticatedGet<WorkoutLogWithExercises>(
    `/api/workout-logs/${logId}`
  );
};

/**
 * Obtiene los exercise logs de un workout específico
 * Método HTTP: GET /api/workout-logs/:id/exercise-logs
 */
export const getWorkoutExerciseLogs = async (
  workoutLogId: string
): Promise<ExerciseLog[]> => {
  return authenticatedGet<ExerciseLog[]>(
    `/api/workout-logs/${workoutLogId}/exercise-logs`
  );
};

/**
 * Actualiza un workout log
 * Método HTTP: PUT /api/workout-logs/:id
 */
export const updateWorkoutLog = async (
  logId: string,
  data: UpdateWorkoutLogRequest
): Promise<WorkoutLog> => {
  return authenticatedPut<WorkoutLog>(`/api/workout-logs/${logId}`, data);
};

/**
 * Completa un workout log
 * Método HTTP: PUT /api/workout-logs/:id
 */
export const completeWorkoutLog = async (
  logId: string,
  rating?: number,
  notes?: string
): Promise<WorkoutLog> => {
  const completedAt = new Date().toISOString();
  const request: UpdateWorkoutLogRequest = {
    completed_at: completedAt,
    rating,
    notes,
  };

  return authenticatedPut<WorkoutLog>(`/api/workout-logs/${logId}`, request);
};

/**
 * Registra una serie de un ejercicio
 * Método HTTP: POST /api/workout-logs/:id/exercise-logs
 */
export const logExerciseSet = async (
  workoutLogId: string,
  data: CreateExerciseSetRequest
): Promise<ExerciseLog> => {
  return authenticatedPost<ExerciseLog>(
    `/api/workout-logs/${workoutLogId}/exercise-logs`,
    data
  );
};

/**
 * Obtiene el historial de ejercicios para ver el progreso
 * Método HTTP: GET /api/exercise-logs/history
 */
export const getExerciseHistory = async (
  userId: string,
  exerciseName: string,
  limit: number = 10
): Promise<ExerciseLog[]> => {
  return authenticatedGet<ExerciseLog[]>(
    `/api/exercise-logs/history?user_id=${userId}&exercise_name=${encodeURIComponent(
      exerciseName
    )}&limit=${limit}`
  );
};

/**
 * Obtiene todos los workout logs del usuario
 * Método HTTP: GET /api/workout-logs
 */
export const getUserWorkoutLogs = async (
  userId: string,
  limit?: number,
  offset?: number
): Promise<WorkoutLog[]> => {
  const params = new URLSearchParams({
    user_id: userId,
  });

  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  return authenticatedGet<WorkoutLog[]>(
    `/api/workout-logs?${params.toString()}`
  );
};
