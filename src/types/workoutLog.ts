// src/types/workoutLog.ts
export interface CreateWorkoutLogRequest {
  day_routine_id?: string;
  routine_id?: string;
  day_name?: string;
  notes?: string;
}

export interface UpdateWorkoutLogRequest {
  completed_at?: string;
  rating?: number;
  notes?: string;
  energy_level?: number;
}

export interface CreateExerciseSetRequest {
  exercise_name: string;
  set_number: number;
  reps_completed?: number;
  weight_kg?: number;
  weight_lbs?: number;
  rpe_actual?: number;
  notes?: string;
}

// src/Models/workoutLogsModel.ts

export interface WorkoutLog {
  id: string;
  user_id: string;
  day_routine_id?: string | null;
  routine_id?: string | null;
  workout_date: string;
  started_at?: string | null;
  completed_at?: string | null;
  duration_minutes?: number | null;
  total_volume?: number | null;
  notes?: string | null;
  rating?: number | null;
  energy_level?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_id?: string | null;
  exercise_catalog_id?: string | null;
  exercise_name: string;
  set_number: number;
  reps_completed?: number | null;
  weight_kg?: number | null;
  weight_lbs?: number | null;
  rpe_actual?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  is_warmup?: boolean;
  is_drop_set?: boolean;
  is_failure?: boolean;
  created_at?: string;
}
