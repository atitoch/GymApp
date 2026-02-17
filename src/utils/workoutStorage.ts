import type { ExerciseLog } from "../types/workoutLog";

/**
 * Utilidad para persistir workout logs en localStorage
 * Esto previene pérdida de datos al recargar la página
 */

const STORAGE_PREFIX = "workout_log_";

export interface WorkoutStorage {
  workoutLogId: string;
  userId: string;
  dayRoutineId?: string;
  date: string;
  startedAt: string;
  exerciseLogs: Record<string, ExerciseLog[]>; // Convertido de Map para JSON
  lastUpdated: string;
  needsSync: boolean; // Si necesita sincronizar con backend
}

/**
 * Genera la clave de storage para un usuario y fecha
 */
const getStorageKey = (userId: string, date: string): string => {
  return `${STORAGE_PREFIX}${userId}_${date}`;
};

/**
 * Guarda el workout log en localStorage
 */
export const saveWorkoutToStorage = (
  userId: string,
  date: string,
  data: Omit<WorkoutStorage, "lastUpdated">
): void => {
  try {
    const storage: WorkoutStorage = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const key = getStorageKey(userId, date);
    localStorage.setItem(key, JSON.stringify(storage));
    console.log("💾 Workout guardado en localStorage:", key);
  } catch (error) {
    console.error("Error al guardar workout en localStorage:", error);
  }
};

/**
 * Carga el workout log desde localStorage
 */
export const loadWorkoutFromStorage = (
  userId: string,
  date: string
): WorkoutStorage | null => {
  try {
    const key = getStorageKey(userId, date);
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    const storage: WorkoutStorage = JSON.parse(data);
    console.log("📂 Workout cargado desde localStorage:", key);
    return storage;
  } catch (error) {
    console.error("Error al cargar workout desde localStorage:", error);
    return null;
  }
};

/**
 * Elimina el workout log de localStorage
 */
export const clearWorkoutFromStorage = (userId: string, date: string): void => {
  try {
    const key = getStorageKey(userId, date);
    localStorage.removeItem(key);
    console.log("🗑️ Workout eliminado de localStorage:", key);
  } catch (error) {
    console.error("Error al eliminar workout de localStorage:", error);
  }
};

/**
 * Convierte exerciseLogs de Map a Object para storage
 */
export const exerciseLogsMapToObject = (
  map: Map<string, ExerciseLog[]>
): Record<string, ExerciseLog[]> => {
  const obj: Record<string, ExerciseLog[]> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Convierte exerciseLogs de Object a Map desde storage
 */
export const exerciseLogsObjectToMap = (
  obj: Record<string, ExerciseLog[]>
): Map<string, ExerciseLog[]> => {
  const map = new Map<string, ExerciseLog[]>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
};

/**
 * Obtiene todos los workouts que necesitan sincronización
 */
export const getWorkoutsNeedingSync = (): WorkoutStorage[] => {
  try {
    const workouts: WorkoutStorage[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          const workout: WorkoutStorage = JSON.parse(data);
          if (workout.needsSync) {
            workouts.push(workout);
          }
        }
      }
    }

    return workouts;
  } catch (error) {
    console.error("Error al obtener workouts para sincronizar:", error);
    return [];
  }
};

/**
 * Marca un workout como sincronizado
 */
export const markWorkoutAsSynced = (
  userId: string,
  date: string,
  realWorkoutLogId: string
): void => {
  try {
    const workout = loadWorkoutFromStorage(userId, date);
    if (workout) {
      workout.needsSync = false;
      workout.workoutLogId = realWorkoutLogId; // Actualizar con el ID real del backend
      saveWorkoutToStorage(userId, date, workout);
      console.log("✅ Workout marcado como sincronizado");
    }
  } catch (error) {
    console.error("Error al marcar workout como sincronizado:", error);
  }
};

/**
 * Limpia workouts antiguos (más de 7 días)
 */
export const cleanOldWorkouts = (): void => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          const workout: WorkoutStorage = JSON.parse(data);
          const workoutDate = new Date(workout.date);

          // Eliminar solo si está sincronizado y es antiguo
          if (!workout.needsSync && workoutDate < sevenDaysAgo) {
            localStorage.removeItem(key);
            console.log("🧹 Workout antiguo limpiado:", key);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al limpiar workouts antiguos:", error);
  }
};
