import { Edit2, Trash2 } from 'lucide-react';
import type { DayRoutine } from '../types/routineType';

interface DayHeaderProps {
  currentRoutine: DayRoutine;
  handleBackToWeek: () => void;
}

export const DayHeader: React.FC<DayHeaderProps> = ({
  currentRoutine,
  handleBackToWeek,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <button
          onClick={handleBackToWeek}
          className="text-blue-500 hover:text-blue-400 mb-3 flex items-center gap-2 transition-colors"
        >
          ← Volver a la semana
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-50">
                {currentRoutine.day}
              </h1>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full">
                {currentRoutine.dayName}
              </span>
            </div>
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
