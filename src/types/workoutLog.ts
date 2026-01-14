// Tipos para workout logs y exercise sets (basados en la estructura de la BD)

export interface ExerciseLog {
  id?: string;
  workout_log_id: string;
  exercise_id?: string; // Referencia al ejercicio en la rutina
  exercise_catalog_id?: string; // Referencia al catálogo de ejercicios
  exercise_name: string; // Nombre del ejercicio (preservado)
  set_number: number; // Número de serie (1, 2, 3, etc.)
  reps_completed?: number; // Repeticiones completadas
  weight_kg?: number; // Peso en kilogramos
  weight_lbs?: number; // Peso en libras
  rpe_actual?: number; // RPE real sentido (1-10)
  rest_seconds?: number; // Tiempo de descanso en segundos
  notes?: string; // Notas específicas de esta serie
  is_warmup?: boolean; // Indica si fue serie de calentamiento
  is_drop_set?: boolean; // Indica si fue drop set
  is_failure?: boolean; // Indica si llegó al fallo
  created_at?: string;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  day_routine_id?: string;
  routine_id?: string;
  workout_date: string; // ISO date string
  started_at?: string; // ISO timestamp
  completed_at?: string; // ISO timestamp
  duration_minutes?: number;
  total_volume?: number; // Suma de peso × reps
  notes?: string;
  rating?: number; // 1-10
  energy_level?: number; // 1-10
  created_at?: string;
  updated_at?: string;
}

// Tipo extendido que incluye los exercise logs
export interface WorkoutLogWithExercises extends WorkoutLog {
  exercise_logs?: ExerciseLog[];
}

// Tipos para peticiones al backend
export interface CreateWorkoutLogRequest {
  day_routine_id?: string;
  routine_id?: string;
  workout_date?: string; // Si no se proporciona, usa la fecha actual
  started_at?: string;
}

export interface UpdateWorkoutLogRequest {
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  rating?: number;
  energy_level?: number;
}

export interface CreateExerciseSetRequest {
  exercise_id?: string;
  exercise_catalog_id?: string;
  exercise_name: string;
  set_number: number;
  reps_completed: number;
  weight_kg?: number;
  weight_lbs?: number;
  rpe_actual?: number;
  rest_seconds?: number;
  notes?: string;
  is_warmup?: boolean;
  is_drop_set?: boolean;
  is_failure?: boolean;
}

// Tipo para el estado local del progreso del entrenamiento
export interface WorkoutProgress {
  workoutLogId: string;
  exerciseLogs: Map<string, ExerciseLog[]>; // key: exercise_name, value: array de sets
  currentExercise?: string;
  startTime: Date;
}

// Tipo para agrupar ejercicios con sus sets
export interface ExerciseWithSets {
  exercise_name: string;
  sets: ExerciseLog[];
  target_sets?: string;
  target_reps?: string;
  target_rpe?: string;
}
