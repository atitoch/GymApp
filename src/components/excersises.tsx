import type { Section } from '../types/routineType';

interface ExerciseProps {
  section: Section;
}

export const Exercises: React.FC<ExerciseProps> = ({ section }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full" />
        {section.title}
      </h2>

      <div className="space-y-4">
        {section.exercises.map((exercise, eIdx) => (
          <div
            key={eIdx}
            className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  {exercise.name}
                </h3>
                {exercise.notes && (
                  <p className="text-sm text-slate-400 italic">
                    {exercise.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Series</div>
                <div className="text-slate-50 font-semibold">
                  {exercise.sets}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Reps</div>
                <div className="text-slate-50 font-semibold">
                  {exercise.reps}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">RPE</div>
                <div className="text-green-400 font-semibold">
                  {exercise.rpe}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Descanso
                </div>
                <div className="text-slate-50 font-semibold text-sm">
                  {exercise.rest}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
