import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Week as WeekComponent } from '../components/week';
import { routineData } from '../services/routine';

export const Week: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const currentRoutines = userId ? routineData[userId] : [];

  const handleBackToSelect = () => {
    navigate('/select');
  };

  const handleDaySelect = (dayIndex: number) => {
    navigate(`/routine/${userId}/${dayIndex}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          currentUser={userId || null}
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
