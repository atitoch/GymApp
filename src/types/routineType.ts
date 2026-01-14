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

// ============================================
// Tipos de respuesta del API (contrato con el backend)
// ============================================

/**
 * Estructura exacta de DayRoutine que devuelve el backend
 * Incluye campos adicionales de metadatos que no son parte del dominio interno
 */
export interface DayRoutineResponse extends DayRoutine {
  id: string; // UUID del día de rutina
  orderIndex: number; // Índice de orden dentro del patrón
  createdAt: string; // ISO date string - fecha de creación
  updatedAt: string; // ISO date string - fecha de actualización
}

/**
 * Estructura exacta de RoutinePattern que devuelve el backend
 * Representa el contrato completo con el API
 */
export interface RoutinePatternResponse {
  id: string;
  userId: string;
  pattern: string[]; // Ej: ['PUSH', 'PULL', 'LEG', 'DESCANSO']
  startDate: string; // ISO date string - fecha de inicio del ciclo
  isCyclic: boolean; // Indica si el patrón es cíclico
  routines: DayRoutineResponse[]; // Rutinas definidas para cada tipo en el patrón
}

// ============================================
// Tipos internos de dominio (para uso en la aplicación)
// ============================================

/**
 * Estructura para datos del backend transformados al dominio interno
 * Este tipo se usa después de transformar RoutinePatternResponse
 */
export interface RoutinePattern {
  id: string;
  userId: string;
  pattern: string[]; // Ej: ['PUSH', 'PULL', 'LEG', 'DESCANSO']
  startDate: string; // ISO date string - fecha de inicio del ciclo
  startDayOfWeek?: number; // Día de la semana preferido (0=Domingo, 1=Lunes, ..., 6=Sábado). Si se especifica, ajusta startDate
  routines: DayRoutine[]; // Rutinas definidas para cada tipo en el patrón (sin metadatos del API)
}

// Estructura para la rutina del día actual calculada
export interface CalculatedDayRoutine extends DayRoutine {
  dayNumber: number; // Día consecutivo desde el inicio (1, 2, 3, ...)
  cycleDay: number; // Día dentro del ciclo del patrón (0, 1, 2, ...)
  patternType: string; // Tipo del patrón para este día (PUSH, PULL, etc.)
  date: string; // Fecha correspondiente a este día
}
