import type {
  RoutinePattern,
  CalculatedDayRoutine,
} from "../types/routineType";

/**
 * Obtiene la fecha actual en la zona horaria del usuario
 * @returns Fecha actual en formato YYYY-MM-DD según la zona horaria local
 */
export const getTodayInUserTimezone = (): string => {
  const now = new Date();
  // Usar métodos de fecha local para obtener la fecha según la zona horaria del usuario
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parsea una fecha ISO string a Date en la zona horaria local del usuario
 * @param dateString Fecha en formato YYYY-MM-DD
 * @returns Date object en zona horaria local
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Ajusta una fecha al día de la semana especificado
 * @param date Fecha base
 * @param dayOfWeek Día de la semana deseado (0=Domingo, 1=Lunes, ..., 6=Sábado)
 * @param direction 'past' = día pasado más cercano, 'future' = día futuro más cercano, 'nearest' = más cercano en cualquier dirección
 * @returns Fecha ajustada al día de la semana
 */
/**
 * Obtiene el lunes de la semana de una fecha dada
 * (Semana empieza en lunes)
 */
export const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  // Si es domingo (0), retroceder 6 días. Si es lunes (1), retroceder 0 días, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const adjustToDayOfWeek = (
  date: Date,
  dayOfWeek: number,
  direction: "past" | "future" | "nearest" = "nearest"
): Date => {
  const currentDayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  let daysToAdd = dayOfWeek - currentDayOfWeek;

  if (direction === "past") {
    // Ir al mismo día de esta semana (lun-dom)
    // Si el día ya pasó esta semana, usar ese día de esta semana
    // Si es el mismo día, usar hoy
    // Si el día aún no ha llegado esta semana, usar el de la semana pasada
    if (daysToAdd > 0) {
      daysToAdd -= 7;
    }
  } else if (direction === "future") {
    // Ir al mismo día de la semana próxima si ya pasó
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
  } else if (direction === "nearest") {
    if (daysToAdd > 3) {
      daysToAdd -= 7;
    } else if (daysToAdd < -3) {
      daysToAdd += 7;
    }
  }

  const adjustedDate = new Date(date);
  adjustedDate.setDate(date.getDate() + daysToAdd);
  adjustedDate.setHours(0, 0, 0, 0);
  return adjustedDate;
};

/**
 * Calcula el día consecutivo desde la fecha de inicio
 * Si startDayOfWeek está especificado, ajusta la fecha de inicio al día de la semana más cercano
 * Permite fechas futuras (devuelve valores negativos o 0 si la fecha aún no ha llegado)
 * @param startDate Fecha de inicio del ciclo (ISO string YYYY-MM-DD)
 * @param targetDate Fecha objetivo (default: hoy en zona horaria del usuario)
 * @param startDayOfWeek Día de la semana preferido (0=Domingo, 1=Lunes, ..., 6=Sábado). Opcional
 * @returns Número de días desde el inicio (1-indexed). Puede ser <= 0 si la fecha es futura
 */
export const calculateDayNumber = (
  startDate: string,
  targetDate?: Date,
  startDayOfWeek?: number
): number => {
  // Usar targetDate proporcionado o la fecha actual en zona horaria del usuario
  const target = targetDate
    ? (() => {
        const t = new Date(targetDate);
        t.setHours(0, 0, 0, 0);
        return t;
      })()
    : parseLocalDate(getTodayInUserTimezone());

  // Si se especifica startDayOfWeek, usar el día de la semana directamente
  // Esto es MUCHO más simple: si startDayOfWeek = 1 (lunes), entonces:
  // Lunes = día 1, Martes = día 2, ..., Domingo = día 7
  if (
    startDayOfWeek !== undefined &&
    startDayOfWeek !== null &&
    startDayOfWeek >= 0 &&
    startDayOfWeek <= 6
  ) {
    const currentDayOfWeek = target.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

    // Convertir a día de la rutina (1-indexed, empezando desde startDayOfWeek)
    // Si startDayOfWeek = 1 (lunes), queremos: Lun=1, Mar=2, Mié=3, Jue=4, Vie=5, Sáb=6, Dom=7
    let dayNumber: number;

    if (startDayOfWeek === 1) {
      // Semana empieza en lunes (ISO week)
      // getDay(): Dom=0, Lun=1, Mar=2, Mié=3, Jue=4, Vie=5, Sáb=6
      // Queremos: Lun=1, Mar=2, Mié=3, Jue=4, Vie=5, Sáb=6, Dom=7
      dayNumber = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
    } else if (startDayOfWeek === 0) {
      // Semana empieza en domingo
      // getDay(): Dom=0, Lun=1, Mar=2, ...
      // Queremos: Dom=1, Lun=2, Mar=3, ...
      dayNumber = currentDayOfWeek + 1;
    } else {
      // Otros casos: calcular offset desde startDayOfWeek
      const offset = (currentDayOfWeek - startDayOfWeek + 7) % 7;
      dayNumber = offset + 1;
    }

    return dayNumber;
  }

  // Si no se especifica startDayOfWeek, usar startDate para calcular
  if (!startDate || typeof startDate !== "string") {
    return 1;
  }

  const start = parseLocalDate(startDate);
  if (isNaN(start.getTime())) {
    return 1;
  }

  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
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
): string | undefined => {
  // Validar que el patrón tenga elementos
  if (!pattern || pattern.length === 0) {
    return undefined;
  }

  // Validar que dayNumber sea válido (debe ser >= 1)
  if (!dayNumber || dayNumber < 1) {
    return undefined;
  }

  // dayNumber es 1-indexed, pero para el array necesitamos 0-indexed
  const index = (dayNumber - 1) % pattern.length;
  const patternType = pattern[index];

  return patternType;
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
 * @param startDate Fecha de inicio del ciclo (ISO string YYYY-MM-DD)
 * @param dayNumber Día consecutivo desde el inicio (1-indexed)
 * @param startDayOfWeek Día de la semana preferido (0=Domingo, 1=Lunes, ..., 6=Sábado). Opcional
 * @returns Fecha correspondiente a ese día en formato YYYY-MM-DD (zona horaria local)
 */
export const getDateForDay = (
  startDate: string,
  dayNumber: number,
  startDayOfWeek?: number
): string => {
  const today = parseLocalDate(getTodayInUserTimezone());

  // Si se especifica startDayOfWeek, calcular la fecha basándose en el día de la semana
  if (
    startDayOfWeek !== undefined &&
    startDayOfWeek !== null &&
    startDayOfWeek >= 0 &&
    startDayOfWeek <= 6
  ) {
    // Calcular el día actual de la rutina (1-7)
    const currentDayOfWeek = today.getDay();
    let currentDayNumber: number;

    if (startDayOfWeek === 1) {
      currentDayNumber = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
    } else if (startDayOfWeek === 0) {
      currentDayNumber = currentDayOfWeek + 1;
    } else {
      currentDayNumber = ((currentDayOfWeek - startDayOfWeek + 7) % 7) + 1;
    }

    // Calcular la diferencia en días entre el día solicitado y el día actual
    const daysDiff = dayNumber - currentDayNumber;

    // Calcular la fecha objetivo
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysDiff);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Si no se especifica startDayOfWeek, usar startDate para calcular
  const start = parseLocalDate(startDate);
  const targetDate = new Date(start);
  targetDate.setDate(start.getDate() + (dayNumber - 1));

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  // Validar dayNumber (debe ser >= 1, pero permitimos valores negativos para fechas futuras)
  // Los valores negativos se normalizarán al calcular el ciclo
  if (!dayNumber || dayNumber === 0) {
    return null;
  }

  // Si dayNumber es negativo o 0 (fecha futura), usar día 1 para el cálculo del patrón
  // pero mantener el dayNumber original para la fecha
  // Esto permite mostrar la rutina que correspondería al primer día del ciclo
  const normalizedDayNumber = dayNumber < 1 ? 1 : dayNumber;

  // Validar que el patrón tenga elementos válidos
  if (!routinePattern.pattern || routinePattern.pattern.length === 0) {
    return null;
  }

  // Filtrar elementos inválidos del patrón
  const validPattern = routinePattern.pattern.filter(
    (p) =>
      p !== null && p !== undefined && typeof p === "string" && p.trim() !== ""
  );

  if (validPattern.length === 0) {
    return null;
  }

  const patternType = getPatternTypeForDay(validPattern, normalizedDayNumber);

  // Validar que patternType sea válido
  if (!patternType) {
    return null;
  }

  const cycleDay = getCycleDay(routinePattern.pattern, normalizedDayNumber);
  const date = getDateForDay(
    routinePattern.startDate,
    dayNumber,
    routinePattern.startDayOfWeek
  );

  // Buscar la rutina que corresponde al tipo del patrón
  // patternType ya está validado arriba, pero agregamos verificación adicional por seguridad
  const routine = routinePattern.routines.find((r) => {
    if (!r || !r.dayName || !patternType) {
      return false;
    }
    return r.dayName.toUpperCase() === patternType.toUpperCase();
  });

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
 * Obtiene las rutinas para mostrar la semana completa (lunes a domingo)
 * Siempre muestra los días 1-7 del patrón (una semana completa)
 * @param routinePattern Patrón de rutina del backend
 * @param _currentDay (ignorado) - Se mantiene por compatibilidad
 * @param daysToShow Número de días a mostrar (default: 7)
 * @returns Array de rutinas calculadas para la semana completa
 */
export const getRoutinesForDisplay = (
  routinePattern: RoutinePattern,
  _currentDay?: number,
  daysToShow: number = 7
): CalculatedDayRoutine[] => {
  // Siempre mostrar desde el día 1 hasta daysToShow (típicamente 7 para una semana)
  // Esto muestra la semana completa de lunes a domingo
  return getRoutinesForRange(routinePattern, 1, daysToShow);
};

/**
 * Obtiene el número del día actual de la semana según el patrón
 * @param routinePattern Patrón de rutina
 * @returns Día actual (1-7) donde 1=Lunes si startDayOfWeek=1
 */
export const getCurrentDayOfWeek = (routinePattern: RoutinePattern): number => {
  return calculateDayNumber(
    routinePattern.startDate,
    undefined,
    routinePattern.startDayOfWeek
  );
};
