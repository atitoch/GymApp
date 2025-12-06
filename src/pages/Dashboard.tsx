import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { RoutineList } from "../components/routineList";
import { fetchUserRoutines } from "../services/routine";
import { EmptyRoutine } from "../components/emptyRoutine";
import { useAuth } from "../contexts/useAuth";
import type { CalculatedDayRoutine } from "../types/routineType";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";
import { Dumbbell, Calendar, TrendingUp, Sparkles } from "lucide-react";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colors = useColors();
  const [routines, setRoutines] = useState<CalculatedDayRoutine[]>([]);
  const [currentDayNumber, setCurrentDayNumber] = useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const loadRoutines = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Obtener rutinas del backend para los próximos 7 días
      const result = await fetchUserRoutines(user.id, 7);

      if (result && result.routines && result.routines.length > 0) {
        setRoutines(result.routines);
        // Usar el currentDayNumber que viene del resultado
        setCurrentDayNumber(result.currentDayNumber);
      } else {
        setRoutines([]);
        setCurrentDayNumber(undefined);
      }
    } catch {
      // Error silencioso, se muestra estado vacío
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleDaySelect = (dayNumber: number) => {
    navigate(`/routine/${dayNumber}`);
  };

  const handleBackToDashboard = () => {
    // Recargar las rutinas sin recargar toda la página
    loadRoutines();
  };

  if (loading) {
    return (
      <div
        className={cn(
          themeClasses.layout.screen,
          themeClasses.backgrounds.primary,
          themeClasses.layout.flexCenter
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <Dumbbell
            className="w-8 h-8 animate-pulse"
            style={{ color: colors.primary[500] }}
          />
          <div className={themeClasses.text.tertiary}>
            Cargando tu rutina...
          </div>
        </div>
      </div>
    );
  }

  // Si no hay rutinas para este usuario
  if (!routines || routines.length === 0) {
    return (
      <div
        className={cn(
          themeClasses.layout.screen,
          themeClasses.backgrounds.primary,
          "p-6 flex flex-col"
        )}
      >
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <Header
            handleBackToSelect={handleBackToDashboard}
            showBackButton={false}
          />
          <div className="flex-1 flex items-center justify-center">
            <EmptyRoutine handleBackToSelect={handleBackToDashboard} />
          </div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas de la semana
  const totalExercises = routines.reduce(
    (acc, routine) =>
      acc +
      routine.sections.reduce(
        (sectionAcc, section) => sectionAcc + section.exercises.length,
        0
      ),
    0
  );
  const workoutDays = routines.filter(
    (routine) => routine.dayName !== "DESCANSO"
  ).length;
  const restDays = routines.length - workoutDays;

  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        "p-6"
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          handleBackToSelect={handleBackToDashboard}
          showBackButton={false}
        />

        {/* Estadísticas de la semana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            className={cn(
              themeClasses.cards.base,
              themeClasses.cards.withShadow,
              "p-6"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.primary[500] + "20" }}
              >
                <Dumbbell
                  className="w-5 h-5"
                  style={{ color: colors.primary[400] }}
                />
              </div>
              <h3
                className={cn(
                  "text-sm font-medium",
                  themeClasses.text.tertiary
                )}
              >
                Ejercicios esta semana
              </h3>
            </div>
            <p className={cn("text-3xl font-bold", themeClasses.text.primary)}>
              {totalExercises}
            </p>
          </div>

          <div
            className={cn(
              themeClasses.cards.base,
              themeClasses.cards.withShadow,
              "p-6"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.status.success + "20" }}
              >
                <Calendar
                  className="w-5 h-5"
                  style={{ color: colors.status.success }}
                />
              </div>
              <h3
                className={cn(
                  "text-sm font-medium",
                  themeClasses.text.tertiary
                )}
              >
                Días de entrenamiento
              </h3>
            </div>
            <p className={cn("text-3xl font-bold", themeClasses.text.primary)}>
              {workoutDays}
            </p>
          </div>

          <div
            className={cn(
              themeClasses.cards.base,
              themeClasses.cards.withShadow,
              "p-6"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.secondary[500] + "20" }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: colors.secondary[400] }}
                />
              </div>
              <h3
                className={cn(
                  "text-sm font-medium",
                  themeClasses.text.tertiary
                )}
              >
                Días de descanso
              </h3>
            </div>
            <p className={cn("text-3xl font-bold", themeClasses.text.primary)}>
              {restDays}
            </p>
          </div>
        </div>

        {/* Título de la semana */}
        <div className="mb-6">
          <h2
            className={cn("text-2xl font-bold mb-2", themeClasses.text.primary)}
          >
            Tu Semana de Entrenamiento
          </h2>
          <p className={themeClasses.text.tertiary}>
            Selecciona un día para ver los detalles de tu rutina
          </p>
        </div>

        {/* Panel semanal de entrenamientos */}
        <RoutineList
          routines={routines}
          handleDaySelect={handleDaySelect}
          currentDayNumber={currentDayNumber}
        />

        {/* Sección de Entrenamientos Personalizados - Próximamente */}
        <div className="mt-12 mb-8">
          <div
            className="relative rounded-2xl border p-8 backdrop-blur-sm"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary[600]}20, ${colors.secondary[600]}20, ${colors.primary[500]}20)`,
              borderColor: colors.primary[500] + "30",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primary[500]}, ${colors.secondary[600]})`,
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className={cn(
                      "text-2xl font-bold",
                      themeClasses.text.primary
                    )}
                  >
                    Entrenamientos Personalizados
                  </h3>
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full border"
                    style={{
                      backgroundColor: colors.primary[500] + "30",
                      color: colors.primary[300],
                      borderColor: colors.primary[400] + "30",
                    }}
                  >
                    Próximamente
                  </span>
                </div>
                <p
                  className={cn(
                    "mb-4 leading-relaxed",
                    themeClasses.text.secondary
                  )}
                >
                  Pronto podrás acceder a entrenamientos personalizados
                  diseñados especialmente para ti. Contacta con nuestros coaches
                  certificados para obtener un plan de entrenamiento adaptado a
                  tus objetivos y necesidades.
                </p>
                <div
                  className="flex items-center gap-2"
                  style={{ color: colors.primary[400] }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Contacta con un coach para más información
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
