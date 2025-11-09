import { useParams, useNavigate } from 'react-router-dom';
import { Cooldown } from '../components/cooldown';
import { DayHeader } from '../components/dayHeader';
import { Exercises } from '../components/excersises';
import { Tips } from '../components/tips';
import { WarmUp } from '../components/warmUp';
import { routineData } from '../services/routine';

export const DayRoutine: React.FC = () => {
  const { userId, dayIndex } = useParams<{
    userId: string;
    dayIndex: string;
  }>();
  const navigate = useNavigate();

  const currentRoutines = userId ? routineData[userId] : [];
  const currentRoutine = currentRoutines[Number(dayIndex)];

  const handleBackToWeek = () => {
    navigate(`/week/${userId}`);
  };

  if (!currentRoutine) {
    return <div>Rutina no encontrada</div>;
  }

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
