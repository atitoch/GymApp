import type { Section } from '../types/routineType';
import ExerciseNotes from './ExerciseNotes';
import { useAuth } from '../contexts/useAuth';
import { Timer } from 'lucide-react';

interface ExerciseProps {
  section: Section;
  onStartRest?: (exerciseName: string) => void;
}

export const Exercises: React.FC<ExerciseProps> = ({
  section,
  onStartRest,
}) => {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-lime-400 rounded-full" />
        {section.title}
      </h2>

      <div className="space-y-4">
        {section.exercises.map((exercise, eIdx) => (
          <div
            key={eIdx}
            className="bg-stone-800 rounded-xl p-6 hover:bg-stone-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-50 mb-2">
                  {exercise.name}
                </h3>
                {exercise.notes && (
                  <p className="text-sm text-stone-400 italic">
                    {exercise.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-xs text-stone-500 mb-1">Series</div>
                <div className="text-stone-50 font-semibold">
                  {exercise.sets}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">Reps</div>
                <div className="text-stone-50 font-semibold">
                  {exercise.reps}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">RPE</div>
                <div className="text-green-400 font-semibold">
                  {exercise.rpe}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-1">Descanso</div>
                <div className="text-stone-50 font-semibold text-sm">
                  {exercise.rest}
                </div>
              </div>
            </div>

            {/* Botón de descanso */}
            {onStartRest && (
              <button
                onClick={() => onStartRest(exercise.name)}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <Timer size={18} />
                Iniciar descanso
              </button>
            )}

            {/* Notas del ejercicio */}
            {user && (
              <ExerciseNotes exerciseName={exercise.name} userId={user.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
