import { UserCards } from '../components/userCards';
import { Dumbbell, Plus } from 'lucide-react';

interface SelectUserProps {
  handleUserSelect: (userId: string) => void;
}

export const SelectUser: React.FC<SelectUserProps> = ({ handleUserSelect }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">
            Gym Routine Tracker
          </h1>
          <p className="text-slate-400 text-lg">¿Quién va a entrenar hoy?</p>
        </div>

        <UserCards onUserSelect={handleUserSelect} />

        <button className="mt-12 mx-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Agregar Usuario
        </button>
      </div>
    </div>
  );
};
