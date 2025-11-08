import React from 'react';
import { Calendar } from 'lucide-react';
import { getUsers } from '../services/users';

interface HeaderProps {
  currentUser: string | null;
  handleBackToSelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  handleBackToSelect,
}) => {
  const users = getUsers();
  const user = users.find((u) => u.id === currentUser);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackToSelect}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-slate-900 transition-transform hover:scale-110"
          style={{ backgroundColor: user?.color }}
        >
          {user?.name[0]}
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-50">{user?.name}</h1>
          <p className="text-slate-400">Rutina Semanal</p>
        </div>
      </div>
      <Calendar className="w-8 h-8 text-blue-500" />
    </div>
  );
};
