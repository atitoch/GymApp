import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { RoutineList } from "../components/routineList";
import { fetchUserRoutines } from "../services/routine";
import { getWeeklyStats } from "../services/workoutLog";
import { getMyCoach, getMyCoachProfile, type MyCoachData } from "../services/coachDashboard";
import { EmptyRoutine } from "../components/emptyRoutine";
import { useAuth } from "../contexts/useAuth";
import type { CalculatedDayRoutine } from "../types/routineType";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";
import { Dumbbell, Calendar, TrendingUp, Sparkles, ChevronRight, ChevronLeft, Users, Star, Flame, AlertCircle } from "lucide-react";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { OnboardingModal } from "../components/OnboardingModal";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const colors = useColors();
  const [routines, setRoutines] = useState<CalculatedDayRoutine[]>([]);
  const [myCoachData, setMyCoachData] = useState<MyCoachData | null>(null);
  const [coachProfileIncomplete, setCoachProfileIncomplete] = useState(false);
  const [currentDayNumber, setCurrentDayNumber] = useState<number | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [weekStats, setWeekStats] = useState<{
    completed_sessions: number;
    days_trained: number;
    total_duration_min: number;
    current_streak: number;
  } | null>(null);

  const loadRoutines = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setLoadError(false);
    try {
      const [result, stats] = await Promise.allSettled([
        fetchUserRoutines(user.id, 7, weekOffset),
        getWeeklyStats(),
      ]);

      // Distinguir "sin rutinas" de "falló la carga" para no mostrar un vacío engañoso
      if (result.status === 'rejected') {
        setLoadError(true);
      }

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

  // Verifica perfil del coach incompleto — depende de role que carga async
  useEffect(() => {
    if (user?.role !== 'coach') return;
    getMyCoachProfile()
      .then(prof => setCoachProfileIncomplete(!prof?.bio?.trim() || !prof?.specialization?.trim()))
      .catch(() => setCoachProfileIncomplete(true));
  }, [user?.role]);

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

  const coachProfileBanner = coachProfileIncomplete && (
    <button
      onClick={() => navigate('/coach/edit-profile')}
      className="w-full mb-6 flex items-center gap-3 bg-amber-400/10 border border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/15 rounded-xl p-4 text-left transition-all group"
    >
      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-300">Completa tu perfil para aparecer en el directorio</p>
        <p className="text-xs text-amber-400/70 mt-0.5">Agrega tu bio y especialización para que los usuarios puedan encontrarte</p>
      </div>
      <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors shrink-0" />
    </button>
  );

  // Si no hay rutinas para este usuario (un coach sin rutina propia cae aquí:
  // el banner también debe mostrarse en esta rama)
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
          {coachProfileBanner}
          <div className="flex-1 flex items-center justify-center">
            {loadError ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center max-w-sm">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-white font-bold">No se pudo cargar tu rutina</p>
                <p className="text-sm text-stone-400 mt-1">Revisa tu conexión e intenta de nuevo.</p>
                <button
                  onClick={loadRoutines}
                  className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-stone-950"
                  style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <EmptyRoutine
                handleBackToSelect={handleBackToDashboard}
                hasCoach={!!myCoachData?.coach}
                coachId={myCoachData?.coach?.users?.id}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const workoutDays = weekStats?.days_trained ?? routines.filter(r => r.dayName !== "DESCANSO").length;
  const completedSessions = weekStats?.completed_sessions ?? 0;
  const totalMinutes = weekStats?.total_duration_min ?? 0;
  const currentStreak = weekStats?.current_streak ?? 0;

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

        {coachProfileBanner}

        {/* Estadísticas de la semana */}
        <div className="gt-stagger grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* Entrenos completados */}
          <div className={cn("bg-stone-800 rounded-xl", themeClasses.cards.withShadow, "p-4 flex flex-col gap-2")}>
            <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: colors.primary[500] + "20" }}>
              <Dumbbell className="w-4 h-4" style={{ color: colors.primary[400] }} />
            </div>
            <p className={cn("text-xs font-medium leading-tight", themeClasses.text.tertiary)}>
              Entrenos completados
            </p>
            <p className={cn("text-2xl md:text-3xl font-bold tabular-nums", themeClasses.text.primary)}>
              {completedSessions}
            </p>
          </div>

          {/* Días de entrenamiento */}
          <div className={cn("bg-stone-800 rounded-xl", themeClasses.cards.withShadow, "p-4 flex flex-col gap-2")}>
            <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: colors.status.success + "20" }}>
              <Calendar className="w-4 h-4" style={{ color: colors.status.success }} />
            </div>
            <p className={cn("text-xs font-medium leading-tight", themeClasses.text.tertiary)}>
              Días entrenados
            </p>
            <p className={cn("text-2xl md:text-3xl font-bold tabular-nums", themeClasses.text.primary)}>
              {workoutDays}
            </p>
          </div>

          {/* Minutos esta semana */}
          <div className={cn("bg-stone-800 rounded-xl", themeClasses.cards.withShadow, "p-4 flex flex-col gap-2")}>
            <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: colors.secondary[500] + "20" }}>
              <TrendingUp className="w-4 h-4" style={{ color: colors.secondary[400] }} />
            </div>
            <p className={cn("text-xs font-medium leading-tight", themeClasses.text.tertiary)}>
              Minutos esta semana
            </p>
            <p className={cn("text-2xl md:text-3xl font-bold tabular-nums", themeClasses.text.primary)}>
              {totalMinutes}
            </p>
          </div>

          {/* Racha actual */}
          <div className={cn("bg-stone-800 rounded-xl", themeClasses.cards.withShadow, "p-4 flex flex-col gap-2")}>
            <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: "#f97316" + "20" }}>
              <Flame className="w-4 h-4" style={{ color: "#f97316" }} />
            </div>
            <p className={cn("text-xs font-medium leading-tight", themeClasses.text.tertiary)}>
              Racha actual
            </p>
            <p className={cn("text-2xl md:text-3xl font-bold tabular-nums", themeClasses.text.primary)}>
              {currentStreak}
              <span className={cn("text-sm font-normal ml-1", themeClasses.text.tertiary)}>
                {currentStreak === 1 ? "día" : "días"}
              </span>
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

        {/* Sección de Entrenamientos Personalizados - solo para usuarios sin coach */}
        {user?.role !== 'coach' && !myCoachData?.coach && <div className="mt-12 mb-8">
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
