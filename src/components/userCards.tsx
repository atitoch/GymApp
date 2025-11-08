import type { User } from '../types/userType';
import { getUsers } from '../services/users';

interface UserCardsProps {
  onUserSelect: (userId: string) => void;
}

export const UserCards: React.FC<UserCardsProps> = ({ onUserSelect }) => {
  const users: User[] = getUsers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onUserSelect(user.id)}
          className="group bg-slate-800 hover:bg-slate-700 rounded-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-slate-900 transition-transform group-hover:scale-110"
            style={{ backgroundColor: user.color }}
          >
            {user.name[0]}
          </div>
          <h3 className="text-xl font-semibold text-slate-50">{user.name}</h3>
        </button>
      ))}
    </div>
  );
};
