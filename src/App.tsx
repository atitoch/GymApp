import { useState } from 'react';
import { Week } from './pages/weekRoutine';
import { SelectUser } from './pages/selectUser';
import { routineData } from './services/routine';
import { DayRoutine } from './pages/dayRoutine';

const App = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [view, setView] = useState<'select' | 'week' | 'routine'>('select');

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setView('week');
    const today = new Date().getDay();
    setSelectedDay(today === 0 ? 6 : today - 1);
  };

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setView('routine');
  };

  const handleBackToWeek = () => {
    setView('week');
  };

  const handleBackToSelect = () => {
    setView('select');
    setSelectedUser(null);
  };

  const currentRoutines = selectedUser ? routineData[selectedUser] : [];
  const currentRoutine = currentRoutines[selectedDay];

  // User selection view
  if (view === 'select') {
    return <SelectUser handleUserSelect={handleUserSelect} />;
  }

  // Week view
  if (view === 'week') {
    return (
      <Week
        selectedUser={selectedUser}
        currentRoutines={currentRoutines}
        handleBackToSelect={handleBackToSelect}
        handleDaySelect={handleDaySelect}
      />
    );
  }

  // Day routine view
  return (
    <DayRoutine
      currentRoutine={currentRoutine}
      handleBackToWeek={handleBackToWeek}
    />
  );
};

export default App;
