export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rpe: string;
  rest: string;
  notes?: string;
}

export interface Section {
  title: string;
  exercises: Exercise[];
}

export interface DayRoutine {
  // Para compatibilidad con datos existentes, day puede ser string (día de semana) o number (día consecutivo)
  day: string | number;
  dayName: string; // Tipo de entrenamiento: PUSH, PULL, LEG, DESCANSO, etc.
  title: string;
  warmup?: string[];
  sections: Section[];
  cooldown?: string[];
}

// Estructura para datos del backend
export interface RoutinePattern {
  id: string;
  userId: string;
  pattern: string[]; // Ej: ['PUSH', 'PULL', 'LEG', 'DESCANSO']
  startDate: string; // ISO date string - fecha de inicio del ciclo
  startDayOfWeek?: number; // Día de la semana preferido (0=Domingo, 1=Lunes, ..., 6=Sábado). Si se especifica, ajusta startDate
  routines: DayRoutine[]; // Rutinas definidas para cada tipo en el patrón
}

// Estructura para la rutina del día actual calculada
export interface CalculatedDayRoutine extends DayRoutine {
  dayNumber: number; // Día consecutivo desde el inicio (1, 2, 3, ...)
  cycleDay: number; // Día dentro del ciclo del patrón (0, 1, 2, ...)
  patternType: string; // Tipo del patrón para este día (PUSH, PULL, etc.)
  date: string; // Fecha correspondiente a este día
}
