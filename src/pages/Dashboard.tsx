import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { RoutineList } from "../components/routineList";
import { fetchUserRoutines } from "../services/routine";
import { getWeeklyStats } from "../services/workoutLog";
import { getMyCoach, type MyCoachData } from "../services/coachDashboard";
import { EmptyRoutine } from "../components/emptyRoutine";
import { useAuth } from "../contexts/useAuth";
import type { CalculatedDayRoutine } from "../types/routineType";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";
import { Dumbbell, Calendar, TrendingUp, Sparkles, ChevronRight, ChevronLeft, Users, Star } from "lucide-react";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { OnboardingModal } from "../components/OnboardingModal";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colors = useColors();
  const [routines, setRoutines] = useState<CalculatedDayRoutine[]>([]);
  const [myCoachData, setMyCoachData] = useState<MyCoachData | null>(null);
  const [currentDayNumber, setCurrentDayNumber] = useState<number | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [weekStats, setWeekStats] = useState<{
    completed_sessions: number;
    days_trained: number;
    total_duration_min: number;
  } | null>(null);

  const loadRoutines = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Only load routines + stats (fast path — no coach endpoint here)
      const [result, stats] = await Promise.allSettled([
        fetchUserRoutines(user.id, 7, weekOffset),
        getWeeklyStats(),
      ]);

      if (result.status === 'fulfilled' && result.value?.routines?.length > 0) {
        setRoutines(result.value.routines);
        setCurrentDayNumber(result.value.currentDayNumber);
        const days = result.value.routines;
        if (days.length >= 7 && days[0].date && days[6].date) {
          const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
          setWeekLabel(`${fmt(days[0].date)} – ${fmt(days[6].date)}`);
        }
      } else {
        setRoutines([]);
        setCurrentDayNumber(undefined);
        setWeekLabel('');
      }

      if (stats.status === 'fulfilled') {
        setWeekStats(stats.value);
      }
    } catch {
      // Error silencioso, se muestra estado vacío
    } finally {
      setLoading(false);
    }
  }, [user?.id, weekOffset]);

  // Show onboarding if user has no first name set
  useEffect(() => {
    if (user && !user.name && !loading) {
      const seen = localStorage.getItem('onboarding_done');
      if (!seen) setShowOnboarding(true);
    }
  }, [user, loading]);

  // Coach widget loads independently — doesn't block the dashboard skeleton
  useEffect(() => {
    if (!user?.id) return;
    getMyCoach()
      .then(setMyCoachData)
      .catch(() => {}); // silent — widget stays hidden if it fails
  }, [user?.id]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleDaySelect = (dayNumber: number) => {
    const dayRoutine = routines.find(r => r.dayNumber === dayNumber);
    navigate(`/routine/${dayNumber}`, {
      state: {
        date: dayRoutine?.date ?? null,
        routine: dayRoutine ?? null,  // full routine with sections/exercises
      },
    });
  };

  const handleBackToDashboard = () => {
    // Recargar las rutinas sin recargar toda la página
    loadRoutines();
  };

  if (loading) {
    return <DashboardSkeleton />;
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

  const workoutDays = weekStats?.days_trained ?? routines.filter(r => r.dayName !== "DESCANSO").length;
  const completedSessions = weekStats?.completed_sessions ?? 0;
  const totalMinutes = weekStats?.total_duration_min ?? 0;

  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        "p-6"
      )}
    >
      {showOnboarding && (
        <OnboardingModal
          onComplete={(name) => {
            localStorage.setItem('onboarding_done', '1');
            setShowOnboarding(false);
            // Refresh page so header picks up new name
            if (name) window.location.reload();
          }}
        />
      )}
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
                Entrenos completados
              </h3>
            </div>
            <p className={cn("text-3xl font-bold", themeClasses.text.primary)}>
              {completedSessions}
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
                Minutos esta semana
              </h3>
            </div>
            <p className={cn("text-3xl font-bold", themeClasses.text.primary)}>
              {totalMinutes}
            </p>
          </div>
        </div>

        {/* Título de la semana */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className={cn("text-2xl font-bold mb-1", themeClasses.text.primary)}>
              {weekOffset === 0 ? 'Esta semana' : weekOffset > 0 ? `Semana +${weekOffset}` : `Semana ${weekOffset}`}
            </h2>
            {weekLabel && (
              <p className={themeClasses.text.tertiary}>{weekLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: colors.text.secondary }}
              title="Semana anterior"
            >
              <ChevronLeft size={20} />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1 text-xs rounded-lg font-medium transition-all"
                style={{ background: colors.primary[500] + '20', color: colors.primary[400] }}
              >
                Hoy
              </button>
            )}
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: colors.text.secondary }}
              title="Próxima semana"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Panel semanal de entrenamientos */}
        <RoutineList
          routines={routines}
          handleDaySelect={handleDaySelect}
          currentDayNumber={currentDayNumber}
        />

        {/* Widget: Mi entrenador */}
        {myCoachData?.coach && (
          <div className="mt-8 mb-2">
            <button
              onClick={() => navigate('/my-coach')}
              className="w-full text-left rounded-2xl border p-4 flex items-center gap-4 hover:border-lime-400/40 transition-colors"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[600]}15, ${colors.primary[500]}08)`,
                borderColor: colors.primary[500] + '25',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.primary[500] + '20' }}
              >
                <Dumbbell className="w-5 h-5" style={{ color: colors.primary[400] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-0.5">Mi entrenador</p>
                <p className="text-white font-bold truncate">
                  {[myCoachData.coach.users?.first_name, myCoachData.coach.users?.last_name].filter(Boolean).join(' ') || 'Entrenador'}
                </p>
                {myCoachData.coach.specialization && (
                  <p className="text-xs truncate" style={{ color: colors.primary[400] }}>
                    {myCoachData.coach.specialization}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-stone-600 shrink-0" />
            </button>
          </div>
        )}

        {/* Sección de Entrenamientos Personalizados - solo si no tiene coach */}
        {!myCoachData?.coach && <div className="mt-12 mb-8">
          <div
            className="relative rounded-2xl border p-4 sm:p-6 md:p-8 backdrop-blur-sm"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary[600]}20, ${colors.secondary[600]}20, ${colors.primary[500]}20)`,
              borderColor: colors.primary[500] + "30",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.primary[500]}, ${colors.secondary[600]})`,
                  }}
                >
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3
                    className={cn(
                      "text-xl sm:text-2xl font-bold",
                      themeClasses.text.primary
                    )}
                  >
                    Entrenamientos Personalizados
                  </h3>
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full border w-fit"
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
                    "mb-4 leading-relaxed text-sm sm:text-base",
                    themeClasses.text.secondary
                  )}
                >
                  Obtén un plan de entrenamiento personalizado con un coach certificado
                  adaptado a tus objetivos y necesidades.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => navigate('/coaches')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
                    style={{ background: `linear-gradient(135deg,${colors.primary[400]},${colors.primary[600]})` }}
                  >
                    <Users className="w-4 h-4" />
                    Ver coaches
                  </button>
                  {user?.role === 'user' && (
                    <button
                      onClick={() => navigate('/apply-as-coach')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:bg-white/5"
                      style={{ borderColor: colors.primary[500] + '40', color: colors.primary[400] }}
                    >
                      <Star className="w-4 h-4" />
                      Ser coach
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};
