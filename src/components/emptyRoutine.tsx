import { AlertCircle, Dumbbell, Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useColors } from "../theme";

interface EmptyRoutineProps {
  handleBackToSelect?: () => void;
  hasCoach?: boolean;
  coachId?: string;
}

export const EmptyRoutine: React.FC<EmptyRoutineProps> = ({
  hasCoach = false,
  coachId,
}) => {
  const colors = useColors();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 border-2"
            style={{
              backgroundColor: colors.background.tertiary,
              borderColor: colors.border.default,
            }}
          >
            <Dumbbell
              className="w-10 h-10"
              style={{ color: colors.text.tertiary }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle
              className="w-6 h-6"
              style={{ color: colors.status.warning }}
            />
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              No hay rutina disponible
            </h1>
          </div>
          <p
            className="mb-6"
            style={{ color: colors.text.tertiary }}
          >
            {hasCoach
              ? "Tu coach aún no ha configurado una rutina para ti. Puedes escribirle directamente."
              : "Aún no tienes un coach asignado. Busca uno para recibir un plan de entrenamiento personalizado."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {hasCoach ? (
            <button
              onClick={() => navigate(coachId ? `/messages/${coachId}` : '/messages')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-stone-950 transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[600]})` }}
            >
              <MessageCircle className="w-5 h-5" />
              Escribirle a mi coach
            </button>
          ) : (
            <button
              onClick={() => navigate('/coaches')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-stone-950 transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[600]})` }}
            >
              <Users className="w-5 h-5" />
              Buscar un coach
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
