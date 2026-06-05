import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Cooldown } from '../components/cooldown';
import { DayHeader } from '../components/dayHeader';
import { Tips } from '../components/tips';
import { WarmUp } from '../components/warmUp';
import { routineData, fetchDayRoutine, fetchDayRoutineByDate } from '../services/routine';
import { getTodayInUserTimezone } from '../utils/routineCalculations';
import type { CalculatedDayRoutine } from '../types/routineType';
import { themeClasses, cn } from '../theme/constants';
import { useAuth } from '../contexts/useAuth';
import { DayRoutineSkeleton } from '../components/DayRoutineSkeleton';
import RestTimer from '../components/RestTimer';
import WorkoutProgress, {
  type ExerciseStatus,
} from '../components/WorkoutProgress';
import ExerciseTracker from '../components/ExerciseTracker';
import {
  getOrCreateWorkoutLog,
  logExerciseSet,
  getWorkoutExerciseLogs,
  completeWorkoutLog,
} from '../services/workoutLog';
import type { ExerciseLog } from '../types/workoutLog';
import { CompleteWorkoutModal } from '../components/CompleteWorkoutModal';
import { Flag, Timer } from 'lucide-react';
import { getUserProfile } from '../services/profile';

export const DayRoutine: React.FC = () => {
  const { dayIndex } = useParams<{
    dayIndex: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dateFromNav: string | null = (location.state as any)?.date ?? null;
  const { user } = useAuth();
  const [currentRoutine, setCurrentRoutine] =
    useState<CalculatedDayRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerOpen, setTimerOpen] = useState(false);
  const [exerciseStatuses, setExerciseStatuses] = useState<ExerciseStatus[]>(
    [],
  );
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Map<string, ExerciseLog[]>>(
    new Map(),
  );
  const [isCurrentDay, setIsCurrentDay] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [exerciseTargetSets, setExerciseTargetSets] = useState<
    Map<string, number>
  >(new Map());
  const [workoutLogError, setWorkoutLogError] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(90);

  useEffect(() => {
    const loadRoutine = async () => {
      if (!dayIndex || !user?.id) return;

      setLoading(true);
      const dayNumber = Number(dayIndex);

      try {
        // Si viene fecha desde el dashboard, usarla para buscar la rutina correcta
        const fetchedRoutine = dateFromNav
          ? await fetchDayRoutineByDate(dateFromNav, dayNumber)
          : await fetchDayRoutine(user.id, dayNumber);

        if (fetchedRoutine) {
          setCurrentRoutine(fetchedRoutine);
        } else {
          // Fallback: usar datos locales
          const localRoutines = routineData[user.id] || [];
          const index = (dayNumber - 1) % localRoutines.length;
          const localRoutine = localRoutines[index];

          if (localRoutine) {
            // Use the date from navigation if available (correct day of week)
            let dateString = dateFromNav ?? '';
            if (!dateString) {
              const today = new Date();
              const targetDate = new Date(today);
              targetDate.setDate(today.getDate() + (dayNumber - 1));
              const year = targetDate.getFullYear();
              const month = String(targetDate.getMonth() + 1).padStart(2, '0');
              const day = String(targetDate.getDate()).padStart(2, '0');
              dateString = `${year}-${month}-${day}`;
            }

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
          const month = String(targetDate.getMonth() + 1).padStart(2, '0');
          const day = String(targetDate.getDate()).padStart(2, '0');
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

  // Cargar preferencias del perfil (unidad de peso, tiempo de descanso)
  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (profile) {
          setWeightUnit(profile.weight_unit);
          setDefaultRestSeconds(profile.default_rest_seconds);
        }
      })
      .catch(() => {
        // Preferences unavailable — defaults remain
      });
  }, []);

  // Función helper para parsear el número de sets objetivo
  const parseTargetSets = (sets: string): number => {
    const n = parseInt(sets.split('-')[0]);
    return isNaN(n) ? 3 : n;
  };

  // Inicializa los statuses cuando cargas la rutina del día
  useEffect(() => {
    if (currentRoutine) {
      const allExercises = currentRoutine.sections.flatMap((s) =>
        s.exercises.map((ex) => ({ name: ex.name, completed: false })),
      );
      setExerciseStatuses(allExercises);

      // Crear mapa de sets objetivo por ejercicio
      const setsMap = new Map<string, number>();
      currentRoutine.sections.forEach((section) => {
        section.exercises.forEach((ex) => {
          setsMap.set(ex.name, parseTargetSets(ex.sets));
        });
      });
      setExerciseTargetSets(setsMap);

      // Verificar si es el día actual usando hora local (no UTC)
      setIsCurrentDay(currentRoutine.date === getTodayInUserTimezone());
    }
  }, [currentRoutine]);

  // Inicializar workout log cuando la rutina está lista
  // exerciseTargetSets se excluye del dep array porque es un Map (nueva referencia en cada render)
  // Solo necesitamos que corra cuando la rutina o el estado del día cambien
  useEffect(() => {
    const initWorkoutLog = async () => {
      if (!currentRoutine || !isCurrentDay) return;

      setWorkoutLogError(false);
      try {
        const workoutLog = await getOrCreateWorkoutLog(
          currentRoutine.id,
          currentRoutine.routineId,
        );
        setWorkoutLogId(workoutLog.id);

        // Cargar logs existentes
        const logs = await getWorkoutExerciseLogs(workoutLog.id);
        const logsMap = new Map<string, ExerciseLog[]>();

        logs.forEach((log: ExerciseLog) => {
          const existing = logsMap.get(log.exercise_name) || [];
          logsMap.set(log.exercise_name, [...existing, log]);
        });

        setExerciseLogs(logsMap);

        // Actualizar statuses — derivar targetSets de currentRoutine directamente
        // (exerciseTargetSets es state y puede estar stale en este closure)
        const freshTargetSets = new Map<string, number>();
        currentRoutine.sections.forEach((section) => {
          section.exercises.forEach((ex) => {
            freshTargetSets.set(ex.name, parseTargetSets(ex.sets));
          });
        });

        setExerciseStatuses((prev) =>
          prev.map((ex) => {
            const targetSets = freshTargetSets.get(ex.name) ?? 0;
            const completedSetsCount = logsMap.get(ex.name)?.length ?? 0;
            return {
              ...ex,
              completed: targetSets > 0 && completedSetsCount >= targetSets,
            };
          }),
        );
      } catch (error) {
        console.error('Error al inicializar workout log:', error);
        setWorkoutLogError(true);
      }
    };

    initWorkoutLog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoutine, isCurrentDay]);

  // Función para registrar un set
  const handleLogSet = async (
    exerciseName: string,
    setData: {
      reps_completed?: number;
      weight_kg?: number;
      weight_lbs?: number;
      rpe_actual?: number;
      notes?: string;
    },
  ) => {
    if (!workoutLogId) {
      throw new Error('No hay workout log activo');
    }

    // Calcular el número de set
    const existingSets = exerciseLogs.get(exerciseName) || [];
    const setNumber = existingSets.length + 1;

    // Guardar en backend
    const newLog = await logExerciseSet(workoutLogId, {
      exercise_name: exerciseName,
      set_number: setNumber,
      ...setData,
    });

    // Actualizar estado local
    setExerciseLogs((prev) => {
      const updated = new Map(prev);
      const current = updated.get(exerciseName) || [];
      const newSets = [...current, newLog];
      updated.set(exerciseName, newSets);

      // Verificar si se completaron todas las series del ejercicio
      const targetSets = exerciseTargetSets.get(exerciseName) ?? 0;
      if (targetSets > 0 && newSets.length >= targetSets) {
        setExerciseStatuses((prevStatuses) =>
          prevStatuses.map((ex) =>
            ex.name === exerciseName ? { ...ex, completed: true } : ex,
          ),
        );
      }

      return updated;
    });
  };

  // Función para terminar el entrenamiento
  const handleFinishWorkout = async (data: { rating?: number; notes?: string }) => {
    if (workoutLogId) {
      try {
        await completeWorkoutLog(workoutLogId, data.rating, data.notes);
      } catch {
        // Si falla, igual navegar — no bloquear al usuario
      }
    }
    navigate('/dashboard');
  };

  const handleBackToRoutine = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <DayRoutineSkeleton />;
  }

  if (!currentRoutine) {
    return (
      <div
        className={cn(
          themeClasses.layout.screen,
          themeClasses.layout.flexCenter,
        )}
      >
        <div className={themeClasses.text.tertiary}>Rutina no encontrada</div>
      </div>
    );
  }

  // Determinar si mostrar tips (por ejemplo, en el primer día del ciclo)
  const showTips =
    currentRoutine.cycleDay === 0 || currentRoutine.dayNumber === 1;

  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        'pb-12',
      )}
    >
      {/* Barra de progreso sticky */}
      <WorkoutProgress
        exercises={exerciseStatuses}
        dayName={currentRoutine.dayName}
        sessionStarted={exerciseStatuses.some((e) => e.completed)}
        estimatedMinutes={60}
      />

      <DayHeader
        currentRoutine={currentRoutine}
        handleBackToRoutine={handleBackToRoutine}
      />

      <div className={cn(themeClasses.layout.container, 'py-8')}>
        {currentRoutine.warmup && <WarmUp currentRoutine={currentRoutine} />}

        {(currentRoutine.sections ?? []).map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            <h2 className="text-lg font-semibold text-lime-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-lime-400 rounded-full" />
              {section.title}
            </h2>
            <div className="space-y-4">
              {(section.exercises ?? []).map((exercise, eIdx) => (
                <ExerciseTracker
                  key={eIdx}
                  exercise={exercise}
                  workoutLogId={workoutLogId}
                  completedSets={exerciseLogs.get(exercise.name) || []}
                  onLogSet={handleLogSet}
                  isCurrentDay={isCurrentDay}
                  workoutLogError={workoutLogError}
                  weightUnit={weightUnit}
                />
              ))}
            </div>
          </div>
        ))}

        {currentRoutine.cooldown && (
          <Cooldown cooldown={currentRoutine.cooldown} />
        )}

        {showTips && <Tips />}

        {/* Botones de acción */}
        {isCurrentDay && (
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setTimerOpen(true)}
              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
              style={{
                background: 'rgba(163,230,53,0.12)',
                border: '1px solid rgba(163,230,53,0.3)',
                color: '#a3e635',
              }}
            >
              <Timer size={18} />
              Timer
            </button>
            <button
              onClick={() => setShowFinishDialog(true)}
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
              }}
            >
              <Flag size={18} />
              Terminar
            </button>
          </div>
        )}

      </div>

      {/* Timer flotante */}
      <RestTimer
        isOpen={timerOpen}
        onClose={() => setTimerOpen(false)}
        defaultSeconds={defaultRestSeconds}
        exerciseName=""
        onComplete={() => setTimerOpen(false)}
      />

      {/* Modal para terminar entrenamiento con rating y notas */}
      <CompleteWorkoutModal
        isOpen={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        onComplete={handleFinishWorkout}
        completedSets={Array.from(exerciseLogs.values()).reduce((acc, sets) => acc + sets.length, 0)}
        totalSets={Array.from(exerciseTargetSets.values()).reduce((acc, n) => acc + n, 0)}
      />
    </div>
  );
};
