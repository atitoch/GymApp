import { ChevronRight, Dumbbell, Calendar } from "lucide-react";
import type { CalculatedDayRoutine, DayRoutine } from "../types/routineType";

interface RoutineListProps {
  routines: (DayRoutine | CalculatedDayRoutine)[];
  handleDaySelect: (dayIndex: number) => void;
  currentDayNumber?: number; // Día actual del ciclo (opcional, se calcula si no se proporciona)
}

export const RoutineList: React.FC<RoutineListProps> = ({
  routines,
  handleDaySelect,
  currentDayNumber,
}) => {
  // Determinar si una rutina es CalculatedDayRoutine
  const isCalculatedRoutine = (
    routine: DayRoutine | CalculatedDayRoutine
  ): routine is CalculatedDayRoutine => {
    return "dayNumber" in routine && typeof routine.dayNumber === "number";
  };

  // Formatear el día para mostrar
  const formatDayLabel = (
    routine: DayRoutine | CalculatedDayRoutine
  ): string => {
    if (isCalculatedRoutine(routine)) {
      return `Día ${routine.dayNumber}`;
    }
    // Fallback para rutinas antiguas
    return typeof routine.day === "string" ? routine.day : `Día ${routine.day}`;
  };

  // Formatear la fecha para mostrar
  const formatDate = (
    routine: DayRoutine | CalculatedDayRoutine
  ): string | null => {
    if (isCalculatedRoutine(routine) && routine.date) {
      const date = new Date(routine.date);
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
    return null;
  };

  // Determinar si es el día actual
  const isCurrentDay = (
    routine: DayRoutine | CalculatedDayRoutine,
    index: number
  ): boolean => {
    if (isCalculatedRoutine(routine) && currentDayNumber) {
      return routine.dayNumber === currentDayNumber;
    }
    // Fallback: si no hay dayNumber, usar el primer día como "hoy"
    return index === 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {routines.map((routine, index) => {
        const isToday = isCurrentDay(routine, index);
        const isRest = routine.dayName === "DESCANSO";
        const dayLabel = formatDayLabel(routine);
        const dateLabel = formatDate(routine);
        // Usar dayNumber si está disponible, sino usar el índice
        const dayNumber = isCalculatedRoutine(routine)
          ? routine.dayNumber
          : index + 1;

        return (
          <button
            key={index}
            onClick={() => handleDaySelect(dayNumber)}
            className={`relative bg-slate-800 hover:bg-slate-700 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 ${
              isToday ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {isToday && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-slate-400 uppercase">
                  {dayLabel}
                </h3>
                {dateLabel && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateLabel}</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>

            <div
              className={`text-xl font-bold mb-2 ${
                isRest ? "text-green-400" : "text-slate-50"
              }`}
            >
              {routine.dayName}
            </div>

            <p className="text-sm text-slate-400 line-clamp-2">
              {routine.title}
            </p>

            {!isRest && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Dumbbell className="w-4 h-4" />
                <span>
                  {routine.sections.reduce(
                    (acc, s) => acc + s.exercises.length,
                    0
                  )}{" "}
                  ejercicios
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
