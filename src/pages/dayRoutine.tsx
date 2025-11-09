import { Cooldown } from '../components/cooldown';
import { DayHeader } from '../components/dayHeader';
import { Exercises } from '../components/excersises';
import { Tips } from '../components/tips';
import { WarmUp } from '../components/warmUp';
import type { DayRoutine as DayRoutineType } from '../types/routineType';

interface DayRoutineProps {
  currentRoutine: DayRoutineType;
  handleBackToWeek: () => void;
}

export const DayRoutine: React.FC<DayRoutineProps> = ({
  currentRoutine,
  handleBackToWeek,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <DayHeader
        currentRoutine={currentRoutine}
        handleBackToWeek={handleBackToWeek}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentRoutine.warmup && <WarmUp currentRoutine={currentRoutine} />}

        {currentRoutine.sections.map((section, sIdx) => (
          <Exercises key={sIdx} section={section} />
        ))}

        {currentRoutine.cooldown && (
          <Cooldown cooldown={currentRoutine.cooldown} />
        )}

        {currentRoutine.day === 'Lunes' && <Tips />}
      </div>
    </div>
  );
};
