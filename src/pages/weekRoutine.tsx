import { Header } from '../components/header';
import { Week as WeekComponent } from '../components/week';
import type { DayRoutine } from '../types/routineType';

interface WeekProps {
  selectedUser: string | null;
  currentRoutines: Array<DayRoutine>;
  handleBackToSelect: () => void;
  handleDaySelect: (dayIndex: number) => void;
}

export const Week: React.FC<WeekProps> = ({
  selectedUser,
  currentRoutines,
  handleBackToSelect,
  handleDaySelect,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          currentUser={selectedUser}
          handleBackToSelect={handleBackToSelect}
        />
        {/* Days grid */}
        <WeekComponent
          weekData={currentRoutines}
          handleDaySelect={handleDaySelect}
        />
      </div>
    </div>
  );
};
