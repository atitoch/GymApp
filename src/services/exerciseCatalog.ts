import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from '../utils/api';
import type { MuscleGroup } from '../data/baseCatalog';

export interface CustomExercise {
  id: string;
  coach_id: string;
  name: string;
  muscle_group: MuscleGroup;
  instructions?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CustomExerciseInput {
  name: string;
  muscle_group: MuscleGroup;
  instructions?: string;
  is_active?: boolean;
}

export const getMyExercises = async (): Promise<CustomExercise[]> => {
  const res = await authenticatedGet<{ exercises: CustomExercise[] }>('/coach/exercises');
  return res.exercises ?? [];
};

export const createExercise = async (data: CustomExerciseInput): Promise<CustomExercise> => {
  const res = await authenticatedPost<{ exercise: CustomExercise }>('/coach/exercises', data);
  return res.exercise;
};

export const updateExercise = async (id: string, data: Partial<CustomExerciseInput>): Promise<CustomExercise> => {
  const res = await authenticatedPut<{ exercise: CustomExercise }>(`/coach/exercises/${id}`, data);
  return res.exercise;
};

export const deleteExercise = async (id: string): Promise<void> => {
  await authenticatedDelete(`/coach/exercises/${id}`);
};

/**
 * Used by clients and coaches when selecting exercises in the tracker/editor.
 * Returns the coach's custom exercises for a given coach (visible to their clients).
 */
export const getCoachExercises = async (coachId: string): Promise<CustomExercise[]> => {
  const res = await authenticatedGet<{ exercises: CustomExercise[] }>(`/coaches/${coachId}/exercises`);
  return res.exercises ?? [];
};
