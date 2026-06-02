import { useState } from "react";
import { cn } from "../theme/constants";

interface CompleteWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { rating?: number; notes?: string }) => Promise<void>;
  completedSets: number;
  totalSets: number;
}

export const CompleteWorkoutModal: React.FC<CompleteWorkoutModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  completedSets,
  totalSets,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onComplete({
        rating: rating > 0 ? rating : undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error al completar entrenamiento:", error);
      alert("Error al guardar. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <>
      {/* Blur overlay (non-interactive) */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Clickable wrapper — click outside the card to close */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-gradient-to-b from-stone-900 to-stone-800",
            "rounded-2xl shadow-2xl",
            "w-full max-w-md",
            "p-6",
            "animate-in zoom-in-95 duration-200"
          )}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-50 mb-2">
              ¿Finalizar Entrenamiento?
            </h2>
            <p className="text-sm text-stone-400">
              Has completado {completedSets} de {totalSets} series (
              {Math.round(progressPercentage)}%)
            </p>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-300 mb-3 text-center">
              ¿Cómo te sentiste? (Opcional)
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={cn(
                    "w-12 h-12 rounded-full transition-all duration-200",
                    "flex items-center justify-center",
                    rating >= value
                      ? "bg-yellow-500 text-white scale-110"
                      : "bg-stone-700/50 text-stone-500 hover:bg-stone-600 hover:scale-105"
                  )}
                >
                  <svg
                    className={cn("w-6 h-6", rating >= value && "drop-shadow-lg")}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-stone-400 mt-2">
                {rating === 1 && "Mal día"}
                {rating === 2 && "No fue el mejor"}
                {rating === 3 && "Normal"}
                {rating === 4 && "Buen entrenamiento"}
                {rating === 5 && "¡Excelente!"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Algo que destacar de este entrenamiento?"
              rows={3}
              className={cn(
                "w-full px-4 py-3 text-sm",
                "bg-stone-800/50 border-2 border-stone-700",
                "rounded-xl text-stone-50 placeholder-stone-500",
                "focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20",
                "transition-all duration-200 resize-none"
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold",
                "bg-stone-800 text-stone-300",
                "hover:bg-stone-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSaving}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold",
                "bg-gradient-to-r from-green-500 to-green-600",
                "text-white shadow-lg shadow-green-500/25",
                "hover:from-green-600 hover:to-green-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200",
                "flex items-center justify-center gap-2"
              )}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Finalizar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


