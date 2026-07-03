import { Calendar } from "lucide-react";
import type { DayRoutine, CalculatedDayRoutine } from "../types/routineType";

interface DayHeaderProps {
  currentRoutine: DayRoutine | CalculatedDayRoutine;
  handleBackToRoutine: () => void;
}

export const DayHeader: React.FC<DayHeaderProps> = ({
  currentRoutine,
  handleBackToRoutine,
}) => {
  // Determinar si es CalculatedDayRoutine
  const isCalculatedRoutine = (
    routine: DayRoutine | CalculatedDayRoutine
  ): routine is CalculatedDayRoutine => {
    return "dayNumber" in routine && typeof routine.dayNumber === "number";
  };

  // Formatear el día para mostrar
  const formatDayLabel = (): string => {
    if (isCalculatedRoutine(currentRoutine)) {
      return `Día ${currentRoutine.dayNumber}`;
    }
    return typeof currentRoutine.day === "string"
      ? currentRoutine.day
      : `Día ${currentRoutine.day}`;
  };

  // Formatear la fecha en hora local — new Date("YYYY-MM-DD") se interpreta como UTC
  // lo que en CST (UTC-6) retrocede un día. Se parsea manualmente para evitarlo.
  const formatDate = (): string | null => {
    if (isCalculatedRoutine(currentRoutine) && currentRoutine.date) {
      const [y, m, d] = currentRoutine.date.split("-").map(Number);
      const date = new Date(y, m - 1, d); // hora local, sin conversión UTC
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return null;
  };

  const dayLabel = formatDayLabel();
  const dateLabel = formatDate();

  return (
    <div className="sticky top-0 z-10 w-full bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <button
          onClick={handleBackToRoutine}
          className="text-lime-400 hover:text-lime-300 mb-3 flex items-center gap-2 transition-colors"
        >
          ← Volver al dashboard
        </button>
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-50 truncate">{dayLabel}</h1>
              <span className="px-3 py-1 bg-lime-400/20 text-lime-400 text-sm font-semibold rounded-full whitespace-nowrap">
                {currentRoutine.dayName}
              </span>
            </div>
            {dateLabel && (
              <div className="flex items-center gap-2 text-sm text-stone-400 mb-1 min-w-0">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate capitalize">{dateLabel}</span>
              </div>
            )}
            <p className="text-stone-400 truncate">{currentRoutine.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
