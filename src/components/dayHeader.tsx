import { Edit2, Trash2, Calendar } from "lucide-react";
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

  // Formatear la fecha para mostrar
  const formatDate = (): string | null => {
    if (isCalculatedRoutine(currentRoutine) && currentRoutine.date) {
      const date = new Date(currentRoutine.date);
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
    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <button
          onClick={handleBackToRoutine}
          className="text-amber-500 hover:text-amber-400 mb-3 flex items-center gap-2 transition-colors"
        >
          ← Volver al dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-50">{dayLabel}</h1>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-full">
                {currentRoutine.dayName}
              </span>
            </div>
            {dateLabel && (
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span>{dateLabel}</span>
              </div>
            )}
            <p className="text-slate-400">{currentRoutine.title}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
