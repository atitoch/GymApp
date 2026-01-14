import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Cooldown } from "../components/cooldown";
import { DayHeader } from "../components/dayHeader";
import { Exercises } from "../components/excersises";
import { Tips } from "../components/tips";
import { WarmUp } from "../components/warmUp";
import { routineData, fetchDayRoutine } from "../services/routine";
import type { CalculatedDayRoutine } from "../types/routineType";
import type { ExerciseLog } from "../types/workoutLog";
import { themeClasses, cn } from "../theme/constants";
import { useAuth } from "../contexts/useAuth";
import { DayRoutineSkeleton } from "../components/DayRoutineSkeleton";
import {
  getOrCreateWorkoutLog,
  logExerciseSet,
  getWorkoutExerciseLogs,
} from "../services/workoutLog";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { CompleteWorkoutModal } from "../components/CompleteWorkoutModal";
import {
  loadWorkoutFromStorage,
  saveWorkoutToStorage,
  exerciseLogsMapToObject,
  exerciseLogsObjectToMap,
  markWorkoutAsSynced,
  cleanOldWorkouts,
  type WorkoutStorage,
} from "../utils/workoutStorage";
import { completeWorkoutLog } from "../services/workoutLog";

export const DayRoutine: React.FC = () => {
  const { dayIndex } = useParams<{
    dayIndex: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentRoutine, setCurrentRoutine] =
    useState<CalculatedDayRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Map<string, ExerciseLog[]>>(
    new Map()
  );
  const { toasts, showToast, hideToast } = useToast();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    const loadRoutine = async () => {
      if (!dayIndex || !user?.id) return;

      setLoading(true);
      const dayNumber = Number(dayIndex);

      try {
        // Intentar obtener rutina del backend
        const fetchedRoutine = await fetchDayRoutine(user.id, dayNumber);

        if (fetchedRoutine) {
          setCurrentRoutine(fetchedRoutine);
        } else {
          // Fallback: usar datos locales
          const localRoutines = routineData[user.id] || [];
          const index = (dayNumber - 1) % localRoutines.length;
          const localRoutine = localRoutines[index];

          if (localRoutine) {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + (dayNumber - 1));

            // Usar hora local para evitar problemas de zona horaria
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, "0");
            const day = String(targetDate.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            const convertedRoutine: CalculatedDayRoutine = {
              ...localRoutine,
              day: dayNumber,
              dayNumber,
              cycleDay: index,
              patternType: localRoutine.dayName,
              date: dateString,
            };
            setCurrentRoutine(convertedRoutine);
          }
        }
      } catch {
        // Fallback a datos locales en caso de error
        const localRoutines = routineData[user.id] || [];
        const index = (dayNumber - 1) % localRoutines.length;
        const localRoutine = localRoutines[index];

        if (localRoutine) {
          const today = new Date();
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + (dayNumber - 1));

          // Usar hora local para evitar problemas de zona horaria
          const year = targetDate.getFullYear();
          const month = String(targetDate.getMonth() + 1).padStart(2, "0");
          const day = String(targetDate.getDate()).padStart(2, "0");
          const dateString = `${year}-${month}-${day}`;

          const convertedRoutine: CalculatedDayRoutine = {
            ...localRoutine,
            day: dayNumber,
            dayNumber,
            cycleDay: index,
            patternType: localRoutine.dayName,
            date: dateString,
          };
          setCurrentRoutine(convertedRoutine);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [dayIndex, user?.id]);

  // Cargar o crear workout log cuando se cargue la rutina
  useEffect(() => {
    const loadWorkoutLog = async () => {
      if (!user?.id || !currentRoutine) return;

      const routineDate =
        currentRoutine.date || new Date().toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];

      // Solo cargar/crear workout logs para el día actual
      // Para días pasados/futuros, solo cargar si ya existe en localStorage
      const isCurrentDay = routineDate === today;

      // Limpiar workouts antiguos
      cleanOldWorkouts();

      // 1. Primero intentar cargar desde localStorage
      const cachedWorkout = loadWorkoutFromStorage(user.id, routineDate);

      if (cachedWorkout) {
        console.log("📂 Datos cargados desde localStorage");
        setWorkoutLogId(cachedWorkout.workoutLogId);

        // Limpiar duplicados al cargar
        const cleanedLogs = exerciseLogsObjectToMap(cachedWorkout.exerciseLogs);
        const deduplicatedLogs = new Map<string, ExerciseLog[]>();

        cleanedLogs.forEach((logs, exerciseName) => {
          // Eliminar duplicados por set_number
          const uniqueLogs = logs.filter(
            (log, index, self) =>
              index === self.findIndex((l) => l.set_number === log.set_number)
          );
          deduplicatedLogs.set(exerciseName, uniqueLogs);
        });

        setExerciseLogs(deduplicatedLogs);

        // Guardar la versión limpia de vuelta al localStorage
        if (
          deduplicatedLogs.size !== cleanedLogs.size ||
          Array.from(deduplicatedLogs.values()).some(
            (logs, idx) =>
              logs.length !== Array.from(cleanedLogs.values())[idx]?.length
          )
        ) {
          console.log("🧹 Duplicados encontrados y eliminados");
          cachedWorkout.exerciseLogs =
            exerciseLogsMapToObject(deduplicatedLogs);
          saveWorkoutToStorage(user.id, routineDate, cachedWorkout);
        }

        // Si necesita sincronización y es día actual, intentar sincronizar en segundo plano
        if (
          isCurrentDay &&
          cachedWorkout.needsSync &&
          cachedWorkout.workoutLogId.startsWith("offline-")
        ) {
          console.log("🔄 Intentando sincronizar con backend...");
          tryToSyncWithBackend(cachedWorkout, user.id, routineDate);
        }
        return;
      }

      // 2. Si no hay cache y NO es el día actual, no hacer nada
      // (días pasados/futuros son solo informativos)
      if (!isCurrentDay) {
        console.log("ℹ️ Día no actual - modo solo lectura");
        return;
      }

      // 3. Si no hay cache y ES el día actual, intentar cargar desde backend
      try {
        const workoutLog = await getOrCreateWorkoutLog(
          user.id,
          currentRoutine.day?.toString(),
          undefined
        );

        setWorkoutLogId(workoutLog.id || null);
        console.log("✅ Workout log cargado desde backend:", workoutLog.id);

        // Cargar los exercise logs existentes
        if (workoutLog.id) {
          const logs = await getWorkoutExerciseLogs(workoutLog.id);

          const logsMap = new Map<string, ExerciseLog[]>();
          logs.forEach((log) => {
            const existing = logsMap.get(log.exercise_name) || [];
            logsMap.set(log.exercise_name, [...existing, log]);
          });

          logsMap.forEach((sets, key) => {
            logsMap.set(
              key,
              sets.sort((a, b) => a.set_number - b.set_number)
            );
          });

          setExerciseLogs(logsMap);

          // Guardar en localStorage para backup
          saveWorkoutToStorage(user.id, routineDate, {
            workoutLogId: workoutLog.id,
            userId: user.id,
            dayRoutineId: currentRoutine.day?.toString(),
            date: routineDate,
            startedAt: workoutLog.started_at || new Date().toISOString(),
            exerciseLogs: exerciseLogsMapToObject(logsMap),
            needsSync: false,
          });
        }
      } catch (error) {
        console.error("❌ Error al cargar workout log:", error);
        console.log(
          "⚠️ Modo offline activado - Los datos se guardarán localmente"
        );

        // Crear workout log offline (solo si es día actual)
        if (isCurrentDay) {
          const offlineId = `offline-${Date.now()}`;
          setWorkoutLogId(offlineId);

          // Guardar en localStorage
          saveWorkoutToStorage(user.id, routineDate, {
            workoutLogId: offlineId,
            userId: user.id,
            dayRoutineId: currentRoutine.day?.toString(),
            date: routineDate,
            startedAt: new Date().toISOString(),
            exerciseLogs: {},
            needsSync: true,
          });
        }
      }
    };

    // Función para sincronizar en segundo plano
    const tryToSyncWithBackend = async (
      cachedWorkout: WorkoutStorage,
      userId: string,
      date: string
    ) => {
      try {
        // Intentar crear el workout en el backend
        const workoutLog = await getOrCreateWorkoutLog(
          userId,
          cachedWorkout.dayRoutineId,
          undefined
        );

        if (workoutLog.id) {
          console.log("✅ Sincronizado con backend:", workoutLog.id);

          // Sincronizar todos los exercise logs
          const logs = Object.values(
            cachedWorkout.exerciseLogs
          ).flat() as ExerciseLog[];
          for (const log of logs) {
            try {
              await logExerciseSet(workoutLog.id, {
                exercise_name: log.exercise_name,
                set_number: log.set_number,
                reps_completed: log.reps_completed || 0,
                weight_kg: log.weight_kg,
                weight_lbs: log.weight_lbs,
                rpe_actual: log.rpe_actual,
                notes: log.notes,
                is_warmup: log.is_warmup,
                is_drop_set: log.is_drop_set,
                is_failure: log.is_failure,
              });
            } catch (err) {
              console.error("Error al sincronizar log:", err);
            }
          }

          // Marcar como sincronizado
          markWorkoutAsSynced(userId, date, workoutLog.id);
          setWorkoutLogId(workoutLog.id);
          showToast("✓ Datos sincronizados con el servidor", "success");
        }
      } catch {
        console.log("⚠️ No se pudo sincronizar, continuando en modo offline");
      }
    };

    loadWorkoutLog();
  }, [currentRoutine, user?.id, showToast]);

  const handleBackToRoutine = () => {
    navigate("/dashboard");
  };

  // Función para completar el entrenamiento
  const handleCompleteWorkout = useCallback(
    async (data: { rating?: number; notes?: string }) => {
      if (!workoutLogId) return;

      try {
        // Si no es modo offline, guardar en backend
        if (!workoutLogId.startsWith("offline-")) {
          await completeWorkoutLog(workoutLogId, data.rating, data.notes);
        }

        // Limpiar del localStorage si está sincronizado
        if (user?.id && currentRoutine?.date) {
          const workout = loadWorkoutFromStorage(user.id, currentRoutine.date);
          if (workout && !workout.needsSync) {
            // Opcional: mantener en localStorage o limpiar
          }
        }

        showToast("¡Entrenamiento completado! 🎉", "success");

        // Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (error) {
        console.error("Error al completar entrenamiento:", error);
        showToast("Error al guardar. Los datos están en local.", "error");
      }
    },
    [workoutLogId, user?.id, currentRoutine, showToast, navigate]
  );

  // Función para registrar una serie
  const handleLogSet = useCallback(
    async (
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
    ) => {
      if (!workoutLogId) {
        showToast("Error: No hay workout log activo", "error");
        throw new Error("No hay workout log activo");
      }

      // Calcular el número de serie
      const existingSets = exerciseLogs.get(exerciseName) || [];
      const setNumber = existingSets.length + 1;

      const today =
        currentRoutine?.date || new Date().toISOString().split("T")[0];
      const isOffline = workoutLogId.startsWith("offline-");

      try {
        // Crear log local primero (siempre)
        const localLog: ExerciseLog = {
          id: `local-${Date.now()}`,
          workout_log_id: workoutLogId,
          exercise_name: exerciseName,
          set_number: setNumber,
          ...setData,
          created_at: new Date().toISOString(),
        };

        // Actualizar el estado local inmediatamente (evitar duplicados)
        const newExerciseLogs = new Map(exerciseLogs);
        const sets = newExerciseLogs.get(exerciseName) || [];

        // Verificar que no exista ya este log (evitar duplicados por doble click)
        const existingLog = sets.find((s) => s.set_number === setNumber);
        if (existingLog) {
          console.warn("Serie ya existe, ignorando duplicado");
          return;
        }

        newExerciseLogs.set(exerciseName, [...sets, localLog]);
        setExerciseLogs(newExerciseLogs);

        // Guardar TODO el workout en localStorage después de actualizar
        if (user?.id) {
          const workout = loadWorkoutFromStorage(user.id, today);
          if (workout) {
            // Actualizar con todos los logs del estado, no solo agregar uno
            workout.exerciseLogs = exerciseLogsMapToObject(newExerciseLogs);
            workout.needsSync = true;
            saveWorkoutToStorage(user.id, today, workout);
          }
        }

        // Si estamos en modo offline, solo guardamos localmente
        if (isOffline) {
          console.log("💾 Serie guardada en localStorage (modo offline)");
          showToast(`✓ Serie ${setNumber} guardada localmente`, "info");
          return;
        }

        // Intentar guardar en el backend
        try {
          const newLog = await logExerciseSet(workoutLogId, {
            exercise_name: exerciseName,
            set_number: setNumber,
            ...setData,
          });

          // Actualizar el log local con el ID real del backend
          const updatedExerciseLogs = new Map(newExerciseLogs);
          const currentSets = updatedExerciseLogs.get(exerciseName) || [];
          const updatedSets = currentSets.map((s) =>
            s.id === localLog.id ? { ...newLog } : s
          );
          updatedExerciseLogs.set(exerciseName, updatedSets);
          setExerciseLogs(updatedExerciseLogs);

          console.log("✅ Serie guardada en backend y localStorage");
          showToast(`✓ Serie ${setNumber} registrada`, "success");

          // Actualizar localStorage con needsSync = false y los logs actualizados
          if (user?.id) {
            const workout = loadWorkoutFromStorage(user.id, today);
            if (workout) {
              workout.exerciseLogs =
                exerciseLogsMapToObject(updatedExerciseLogs);
              workout.needsSync = false;
              saveWorkoutToStorage(user.id, today, workout);
            }
          }
        } catch (backendError) {
          console.warn(
            "⚠️ No se pudo guardar en backend, datos en localStorage:",
            backendError
          );
          showToast(`✓ Serie ${setNumber} guardada localmente`, "info");

          // Marcar como necesita sincronización con los logs actualizados
          if (user?.id) {
            const workout = loadWorkoutFromStorage(user.id, today);
            if (workout) {
              workout.exerciseLogs = exerciseLogsMapToObject(newExerciseLogs);
              workout.needsSync = true;
              saveWorkoutToStorage(user.id, today, workout);
            }
          }
        }
      } catch (error) {
        console.error("Error al guardar serie:", error);
        showToast("Error al guardar la serie", "error");
        throw error;
      }
    },
    [workoutLogId, exerciseLogs, showToast, user?.id, currentRoutine]
  );

  // Calcular estadísticas del progreso
  const calculateProgress = useCallback(() => {
    if (!currentRoutine) return { completed: 0, total: 0, percentage: 0 };

    let totalSets = 0;
    let completedSets = 0;

    currentRoutine.sections.forEach((section) => {
      section.exercises.forEach((exercise) => {
        const targetSets = parseInt(exercise.sets.split("-")[0]) || 0;
        totalSets += targetSets;

        const logs = exerciseLogs.get(exercise.name) || [];
        completedSets += Math.min(logs.length, targetSets);
      });
    });

    const percentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    return { completed: completedSets, total: totalSets, percentage };
  }, [currentRoutine, exerciseLogs]);

  if (loading) {
    return <DayRoutineSkeleton />;
  }

  if (!currentRoutine) {
    return (
      <div
        className={cn(
          themeClasses.layout.screen,
          themeClasses.layout.flexCenter
        )}
      >
        <div className={themeClasses.text.tertiary}>Rutina no encontrada</div>
      </div>
    );
  }

  // Determinar si mostrar tips (por ejemplo, en el primer día del ciclo)
  const showTips =
    currentRoutine.cycleDay === 0 || currentRoutine.dayNumber === 1;

  const progress = calculateProgress();

  // Verificar si la rutina es del día actual (solo permitir registro en día actual)
  const isToday = () => {
    if (!currentRoutine?.date) return false;
    const today = new Date().toISOString().split("T")[0];
    return currentRoutine.date === today;
  };

  const canLogExercises = isToday();

  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        "pb-12"
      )}
    >
      <DayHeader
        currentRoutine={currentRoutine}
        handleBackToRoutine={handleBackToRoutine}
      />

      <div className={cn(themeClasses.layout.container, "py-8")}>
        {/* Indicador de día no actual */}
        {!canLogExercises && (
          <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-3 text-slate-300">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="font-semibold text-sm">
                  Vista de solo lectura
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Solo puedes registrar entrenamientos en el día actual. Esta
                  rutina es informativa.
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRoutine.warmup && <WarmUp currentRoutine={currentRoutine} />}

        {currentRoutine.sections.map((section, sIdx) => (
          <Exercises
            key={sIdx}
            section={section}
            workoutLogId={
              canLogExercises ? workoutLogId || undefined : undefined
            }
            exerciseLogs={exerciseLogs}
            onLogSet={canLogExercises ? handleLogSet : undefined}
            isReadOnly={!canLogExercises}
          />
        ))}

        {currentRoutine.cooldown && (
          <Cooldown cooldown={currentRoutine.cooldown} />
        )}

        {showTips && <Tips />}

        {/* Botón de finalizar al final de la rutina - Solo en día actual */}
        {canLogExercises && workoutLogId && (
          <div className="mt-12 pb-8">
            <button
              onClick={() => setShowCompleteModal(true)}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg",
                "bg-gradient-to-r from-green-500 to-green-600",
                "text-white shadow-xl shadow-green-500/30",
                "hover:from-green-600 hover:to-green-700",
                "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                "flex items-center justify-center gap-3"
              )}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Finalizar Entrenamiento
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              Has completado {progress.completed} de {progress.total} series (
              {Math.round(progress.percentage)}%)
            </p>
          </div>
        )}
      </div>

      {/* Floating Progress Widget - Solo mostrar en día actual */}
      {canLogExercises && workoutLogId && progress.total > 0 && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2",
            "bg-gradient-to-r from-slate-800 to-slate-900",
            "border-2 border-slate-700 rounded-2xl shadow-2xl",
            "px-6 py-4 z-30",
            "backdrop-blur-sm bg-opacity-95",
            "animate-in slide-in-from-bottom-5 duration-500"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Progress Circle */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 24 * (1 - progress.percentage / 100)
                  }`}
                  className="text-blue-500 transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-50">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
            </div>

            {/* Progress Text */}
            <div>
              <div className="text-sm font-semibold text-slate-50">
                Progreso del entrenamiento
              </div>
              <div className="text-xs text-slate-400">
                {progress.completed} de {progress.total} series completadas
              </div>
            </div>

            {/* Celebration when complete */}
            {progress.percentage === 100 && (
              <div className="ml-2">
                <span className="text-2xl animate-bounce">🎉</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Complete Workout Modal */}
      <CompleteWorkoutModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={handleCompleteWorkout}
        completedSets={progress.completed}
        totalSets={progress.total}
      />
    </div>
  );
};
