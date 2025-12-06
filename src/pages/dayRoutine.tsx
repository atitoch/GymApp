import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Cooldown } from "../components/cooldown";
import { DayHeader } from "../components/dayHeader";
import { Exercises } from "../components/excersises";
import { Tips } from "../components/tips";
import { WarmUp } from "../components/warmUp";
import { routineData, fetchDayRoutine } from "../services/routine";
import type { CalculatedDayRoutine } from "../types/routineType";
import { themeClasses, cn } from "../theme/constants";
import { useAuth } from "../contexts/useAuth";

export const DayRoutine: React.FC = () => {
  const { dayIndex } = useParams<{
    dayIndex: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentRoutine, setCurrentRoutine] =
    useState<CalculatedDayRoutine | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
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

  const handleBackToRoutine = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div
        className={cn(
          themeClasses.layout.screen,
          themeClasses.layout.flexCenter
        )}
      >
        <div className={themeClasses.text.tertiary}>Cargando rutina...</div>
      </div>
    );
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
        {currentRoutine.warmup && <WarmUp currentRoutine={currentRoutine} />}

        {currentRoutine.sections.map((section, sIdx) => (
          <Exercises key={sIdx} section={section} />
        ))}

        {currentRoutine.cooldown && (
          <Cooldown cooldown={currentRoutine.cooldown} />
        )}

        {showTips && <Tips />}
      </div>
    </div>
  );
};
