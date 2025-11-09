import { ChevronRight, Dumbbell } from 'lucide-react';
import type { DayRoutine } from '../types/routineType';

interface WeekProps {
  weekData: DayRoutine[];
  handleDaySelect: (dayIndex: number) => void;
}

export const Week: React.FC<WeekProps> = ({ weekData, handleDaySelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {weekData.map((routine, index) => {
        const isToday =
          index === new Date().getDay() - 1 ||
          (new Date().getDay() === 0 && index === 6);
        const isRest = routine.dayName === 'DESCANSO';

        return (
          <button
            key={index}
            onClick={() => handleDaySelect(index)}
            className={`relative bg-slate-800 hover:bg-slate-700 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 ${
              isToday ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {isToday && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase">
                {routine.day}
              </h3>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>

            <div
              className={`text-xl font-bold mb-2 ${
                isRest ? 'text-green-400' : 'text-slate-50'
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
                  )}{' '}
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
