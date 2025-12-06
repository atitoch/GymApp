import { AlertCircle, Dumbbell } from "lucide-react";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";

export const EmptyRoutine: React.FC<{ handleBackToSelect: () => void }> = ({
  handleBackToSelect,
}) => {
  const colors = useColors();

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
            Aún no se ha configurado una rutina de entrenamiento para tu cuenta.
            Contacta con tu coach para obtener un plan personalizado.
          </p>
        </div>

        <button
          onClick={handleBackToSelect}
          className={cn(
            themeClasses.buttons.primary,
            "px-8 py-3"
          )}
        >
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );
};
