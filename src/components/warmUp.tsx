import type { DayRoutine } from '../types/routineType';

interface WarmUpProps {
  currentRoutine: DayRoutine;
}

export const WarmUp: React.FC<WarmUpProps> = ({ currentRoutine }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-400 rounded-full" />
        Calentamiento
      </h2>
      <div className="bg-slate-800/50 rounded-xl p-6 space-y-2">
        {currentRoutine.warmup?.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-slate-300">
            <span className="text-slate-600 text-sm mt-1">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
