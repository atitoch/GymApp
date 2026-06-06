import { ChevronRight, Dumbbell, Calendar } from "lucide-react";
import type { CalculatedDayRoutine, DayRoutine } from "../types/routineType";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";

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
  const colors = useColors();
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
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      // El formato es YYYY-MM-DD
      const [year, month, day] = routine.date.split("-").map(Number);
      const date = new Date(year, month - 1, day); // month es 0-indexed
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
    if (isCalculatedRoutine(routine)) {
      // Si hay fecha, es la fuente de verdad — no caer al fallback
      if (routine.date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return routine.date === `${year}-${month}-${day}`;
      }
      // Fallback solo cuando no hay fecha en el objeto
      if (currentDayNumber) {
        return routine.dayNumber === currentDayNumber;
      }
    }
    return index === 0;
  };

  return (
    <div className="gt-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className={cn(
              themeClasses.cards.base,
              themeClasses.cards.hover,
              "relative p-6 text-left border transition-[transform,border-color,background-color] duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[160px]",
              isToday ? "ring-2" : "hover:border-(--color-accent-400)/25"
            )}
            style={{
              borderColor: isToday ? colors.primary[500] : colors.border.default,
            }}
          >
            {isToday && (
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.status.success }}
              />
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <h3
                  className="text-sm font-semibold uppercase"
                  style={{ color: colors.text.tertiary }}
                >
                  {dayLabel}
                </h3>
                {dateLabel && (
                  <div
                    className="flex items-center gap-1 text-xs mt-1"
                    style={{ color: colors.text.placeholder }}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{dateLabel}</span>
                  </div>
                )}
              </div>
              <ChevronRight
                className="w-5 h-5 transition-colors"
                style={{ color: colors.text.placeholder }}
              />
            </div>

            <div
              className="text-xl font-bold mb-2"
              style={{
                color: isRest ? colors.status.success : colors.text.primary,
              }}
            >
              {routine.dayName}
            </div>

            <p
              className="text-sm line-clamp-2"
              style={{ color: colors.text.tertiary }}
            >
              {routine.title}
            </p>

            {!isRest && (
              <div
                className="mt-4 flex items-center gap-2 text-xs"
                style={{ color: colors.text.placeholder }}
              >
                <Dumbbell className="w-4 h-4" />
                <span>
                  {(routine.sections ?? []).reduce(
                    (acc, s) => acc + (s.exercises?.length ?? 0),
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
