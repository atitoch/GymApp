import { useState } from "react";
import type { Section } from "../types/routineType";
import type { ExerciseLog } from "../types/workoutLog";
import { LogSetModal } from "./LogSetModal";

interface ExerciseProps {
  section: Section;
  workoutLogId?: string;
  exerciseLogs?: Map<string, ExerciseLog[]>; // Map de nombre de ejercicio a sus sets
  onLogSet?: (
    exerciseName: string,
    setData: {
      reps_completed: number;
      weight_kg?: number;
      weight_lbs?: number;
      rpe_actual?: number;
      notes?: string;
      is_warmup?: boolean;
      is_drop_set?: boolean;
      is_failure?: boolean;
    }
  ) => Promise<void>;
  isReadOnly?: boolean; // Si es true, no se pueden agregar series (días pasados/futuros)
}

export const Exercises: React.FC<ExerciseProps> = ({
  section,
  workoutLogId,
  exerciseLogs,
  onLogSet,
  isReadOnly = false,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    exerciseName: string;
    exerciseIndex: number;
  }>({
    isOpen: false,
    exerciseName: "",
    exerciseIndex: -1,
  });

  const handleOpenModal = (exerciseName: string, exerciseIndex: number) => {
    setModalState({
      isOpen: true,
      exerciseName,
      exerciseIndex,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      exerciseName: "",
      exerciseIndex: -1,
    });
  };

  const handleSaveSet = async (setData: {
    reps_completed: number;
    weight_kg?: number;
    weight_lbs?: number;
    rpe_actual?: number;
    notes?: string;
    is_warmup?: boolean;
    is_drop_set?: boolean;
    is_failure?: boolean;
  }) => {
    if (onLogSet && modalState.exerciseName) {
      await onLogSet(modalState.exerciseName, setData);
    }
  };

  // Obtener los sets completados para un ejercicio
  const getCompletedSets = (exerciseName: string): ExerciseLog[] => {
    return exerciseLogs?.get(exerciseName) || [];
  };

  // Obtener el último set de un ejercicio
  const getLastSet = (exerciseName: string): ExerciseLog | undefined => {
    const sets = getCompletedSets(exerciseName);
    return sets.length > 0 ? sets[sets.length - 1] : undefined;
  };

  // Calcular el número de la próxima serie
  const getNextSetNumber = (exerciseName: string): number => {
    const sets = getCompletedSets(exerciseName);
    return sets.length + 1;
  };

  // Obtener el ejercicio actual del modal
  const currentExercise =
    modalState.exerciseIndex >= 0
      ? section.exercises[modalState.exerciseIndex]
      : null;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          {section.title}
        </h2>

        <div className="space-y-4">
          {section.exercises.map((exercise, eIdx) => {
            const completedSets = getCompletedSets(exercise.name);
            const targetSets = parseInt(exercise.sets.split("-")[0]) || 0;
            const isCompleted = completedSets.length >= targetSets;

            return (
              <div
                key={eIdx}
                className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700/50 transition-colors relative overflow-hidden"
              >
                {/* Progress bar */}
                {completedSets.length > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (completedSets.length / targetSets) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-50">
                        {exercise.name}
                      </h3>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Completado
                        </span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-slate-400 italic">
                        {exercise.notes}
                      </p>
                    )}

                    {/* Completed sets summary */}
                    {completedSets.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {completedSets.map((set, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md"
                          >
                            S{set.set_number}: {set.reps_completed}r
                            {set.weight_kg && ` × ${set.weight_kg}kg`}
                            {set.weight_lbs && ` × ${set.weight_lbs}lbs`}
                            {set.rpe_actual && ` @${set.rpe_actual}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add set button - Solo mostrar si NO es readonly */}
                  {!isReadOnly && workoutLogId && onLogSet && (
                    <button
                      onClick={() => handleOpenModal(exercise.name, eIdx)}
                      className="ml-4 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Registrar serie"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Icono de solo lectura */}
                  {isReadOnly && (
                    <div
                      className="ml-4 flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-700/50 text-slate-500"
                      title="Solo lectura"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Series</div>
                    <div className="text-slate-50 font-semibold">
                      {completedSets.length > 0 ? (
                        <span className="text-blue-400">
                          {completedSets.length}/{exercise.sets}
                        </span>
                      ) : (
                        exercise.sets
                      )}
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
                    <div className="text-xs text-slate-500 mb-1">Descanso</div>
                    <div className="text-slate-50 font-semibold text-sm">
                      {exercise.rest}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {currentExercise && (
        <LogSetModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          exercise={currentExercise}
          exerciseName={modalState.exerciseName}
          currentSetNumber={getNextSetNumber(modalState.exerciseName)}
          lastSet={getLastSet(modalState.exerciseName)}
          onSave={handleSaveSet}
        />
      )}
    </>
  );
};
