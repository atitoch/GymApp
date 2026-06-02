import {
  authenticatedGet,
  authenticatedPut,
  authenticatedDelete,
} from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExerciseNote {
  id: string;
  user_id: string;
  exercise_name: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseNoteData {
  exercise_name: string;
  note: string;
}

export interface UpdateExerciseNoteData {
  note: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Obtener nota de un ejercicio específico
 */
export const getExerciseNote = async (
  exerciseName: string,
): Promise<ExerciseNote | null> => {
  try {
    const data = await authenticatedGet<ExerciseNote>(
      `/exercise-notes/${encodeURIComponent(exerciseName)}`,
    );
    return data || null;
  } catch {
    return null;
  }
};

/**
 * Crear o actualizar nota de ejercicio
 */
export const upsertExerciseNote = async (
  data: CreateExerciseNoteData,
): Promise<ExerciseNote> => {
  return await authenticatedPut<ExerciseNote>(
    `/exercise-notes/${encodeURIComponent(data.exercise_name)}`,
    { note: data.note },
  );
};

/**
 * Eliminar nota de ejercicio
 */
export const deleteExerciseNote = async (
  exerciseName: string,
): Promise<void> => {
  await authenticatedDelete<void>(
    `/exercise-notes/${encodeURIComponent(exerciseName)}`,
  );
};
