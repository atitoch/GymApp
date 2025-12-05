import type { User } from '../types/userType';
import { getUsers } from '../services/users';
import { themeClasses, cn } from '../theme/constants';
import { useColors } from '../theme';

interface UserCardsProps {
  onUserSelect: (userId: string) => void;
}

export const UserCards: React.FC<UserCardsProps> = ({ onUserSelect }) => {
  const users: User[] = getUsers();
  const colors = useColors();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onUserSelect(user.id)}
          className={cn(
            'group rounded-xl p-8 transition-all duration-300',
            themeClasses.cards.interactive,
            themeClasses.cards.withShadow
          )}
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold transition-transform group-hover:scale-110"
            style={{ 
              backgroundColor: user.color,
              color: colors.text.inverse
            }}
          >
            {user.name[0]}
          </div>
          <h3 className={cn('text-xl font-semibold', themeClasses.text.primary)}>
            {user.name}
          </h3>
        </button>
      ))}
    </div>
  );
};
