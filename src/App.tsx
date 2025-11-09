import { Routes, Route, Navigate } from 'react-router-dom';
import { Week } from './pages/weekRoutine';
import { SelectUser } from './pages/selectUser';
import { DayRoutine } from './pages/dayRoutine';
import { Login } from './pages/login';
import { NotFound } from './pages/notFound';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select" element={<SelectUser />} />
      <Route path="/week/:userId" element={<Week />} />
      <Route path="/routine/:userId/:dayIndex" element={<DayRoutine />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
