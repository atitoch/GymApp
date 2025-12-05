import type {
  RoutinePattern,
  CalculatedDayRoutine,
} from "../types/routineType";

/**
 * Calcula el día consecutivo desde la fecha de inicio
 * @param startDate Fecha de inicio del ciclo (ISO string)
 * @param targetDate Fecha objetivo (default: hoy)
 * @returns Número de días desde el inicio (1-indexed)
 */
export const calculateDayNumber = (
  startDate: string,
  targetDate: Date = new Date()
): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // 1-indexed (día 1 es el primer día)
};

/**
 * Calcula qué tipo de rutina corresponde a un día específico según el patrón
 * @param pattern Patrón de rutina (ej: ['PUSH', 'PULL', 'LEG', 'DESCANSO'])
 * @param dayNumber Día consecutivo desde el inicio (1-indexed)
 * @returns Tipo de rutina para ese día
 */
export const getPatternTypeForDay = (
  pattern: string[],
  dayNumber: number
): string => {
  // dayNumber es 1-indexed, pero para el array necesitamos 0-indexed
  const index = (dayNumber - 1) % pattern.length;
  return pattern[index];
};

/**
 * Calcula el día dentro del ciclo del patrón
 * @param pattern Patrón de rutina
 * @param dayNumber Día consecutivo desde el inicio
 * @returns Día dentro del ciclo (0-indexed)
 */
export const getCycleDay = (pattern: string[], dayNumber: number): number => {
  return (dayNumber - 1) % pattern.length;
};

/**
 * Calcula la fecha correspondiente a un día específico
 * @param startDate Fecha de inicio del ciclo
 * @param dayNumber Día consecutivo desde el inicio
 * @returns Fecha correspondiente a ese día
 */
export const getDateForDay = (startDate: string, dayNumber: number): string => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const targetDate = new Date(start);
  targetDate.setDate(start.getDate() + (dayNumber - 1));
  return targetDate.toISOString().split("T")[0];
};

/**
 * Obtiene la rutina completa para un día específico basado en el patrón
 * @param routinePattern Patrón de rutina del backend
 * @param dayNumber Día consecutivo desde el inicio
 * @returns Rutina calculada para ese día
 */
export const getRoutineForDay = (
  routinePattern: RoutinePattern,
  dayNumber: number
): CalculatedDayRoutine | null => {
  const patternType = getPatternTypeForDay(routinePattern.pattern, dayNumber);
  const cycleDay = getCycleDay(routinePattern.pattern, dayNumber);
  const date = getDateForDay(routinePattern.startDate, dayNumber);

  // Buscar la rutina que corresponde al tipo del patrón
  const routine = routinePattern.routines.find(
    (r) => r.dayName.toUpperCase() === patternType.toUpperCase()
  );

  if (!routine) {
    return null;
  }

  return {
    ...routine,
    day: dayNumber,
    dayNumber,
    cycleDay,
    patternType,
    date,
  };
};

/**
 * Obtiene todas las rutinas para un rango de días
 * @param routinePattern Patrón de rutina del backend
 * @param startDay Día inicial (1-indexed)
 * @param endDay Día final (1-indexed)
 * @returns Array de rutinas calculadas
 */
export const getRoutinesForRange = (
  routinePattern: RoutinePattern,
  startDay: number,
  endDay: number
): CalculatedDayRoutine[] => {
  const routines: CalculatedDayRoutine[] = [];

  for (let day = startDay; day <= endDay; day++) {
    const routine = getRoutineForDay(routinePattern, day);
    if (routine) {
      routines.push(routine);
    }
  }

  return routines;
};

/**
 * Obtiene las rutinas para mostrar en la vista de lista (típicamente próximos 7-14 días)
 * @param routinePattern Patrón de rutina del backend
 * @param currentDay Día actual (default: calculado desde hoy)
 * @param daysToShow Número de días a mostrar (default: 7)
 * @returns Array de rutinas calculadas
 */
export const getRoutinesForDisplay = (
  routinePattern: RoutinePattern,
  currentDay?: number,
  daysToShow: number = 7
): CalculatedDayRoutine[] => {
  const today = currentDay || calculateDayNumber(routinePattern.startDate);
  return getRoutinesForRange(routinePattern, today, today + daysToShow - 1);
};
