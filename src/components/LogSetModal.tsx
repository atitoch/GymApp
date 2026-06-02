import { useState, useEffect } from "react";
import { cn } from "../theme/constants";
import type { Exercise } from "../types/routineType";
import type { ExerciseLog } from "../types/workoutLog";

interface LogSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
  exerciseName: string;
  currentSetNumber: number;
  lastSet?: ExerciseLog; // Última serie registrada para pre-llenar valores
  onSave: (data: {
    reps_completed: number;
    weight_kg?: number;
    weight_lbs?: number;
    rpe_actual?: number;
    notes?: string;
    is_warmup?: boolean;
    is_drop_set?: boolean;
    is_failure?: boolean;
  }) => Promise<void>;
}

export const LogSetModal: React.FC<LogSetModalProps> = ({
  isOpen,
  onClose,
  exercise,
  exerciseName,
  currentSetNumber,
  lastSet,
  onSave,
}) => {
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs"); // Por defecto lbs
  const [rpe, setRpe] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isWarmup, setIsWarmup] = useState(false);
  const [isDropSet, setIsDropSet] = useState(false);
  const [isFailure, setIsFailure] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de validación
  const [repsError, setRepsError] = useState<string>("");
  const [weightError, setWeightError] = useState<string>("");
  const [rpeError, setRpeError] = useState<string>("");

  // Pre-llenar con datos de la última serie
  useEffect(() => {
    if (lastSet) {
      setReps(lastSet.reps_completed?.toString() || "");

      // Cargar peso y unidad de la última serie
      if (lastSet.weight_lbs) {
        setWeight(lastSet.weight_lbs.toString());
        setWeightUnit("lbs");
      } else if (lastSet.weight_kg) {
        setWeight(lastSet.weight_kg.toString());
        setWeightUnit("kg");
      }

      setRpe(lastSet.rpe_actual?.toString() || "");
    }
  }, [lastSet, isOpen]);

  // Resetear al cerrar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setReps("");
        setWeight("");
        setRpe("");
        setNotes("");
        setShowAdvanced(false);
        setIsWarmup(false);
        setIsDropSet(false);
        setIsFailure(false);
        setRepsError("");
        setWeightError("");
        setRpeError("");
      }, 300);
    }
  }, [isOpen]);

  // Validación de repeticiones
  const validateReps = (value: string): boolean => {
    setRepsError("");

    if (!value) {
      setRepsError("Las repeticiones son obligatorias");
      return false;
    }

    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      setRepsError("Debe ser un número mayor a 0");
      return false;
    }

    if (num > 999) {
      setRepsError("Máximo 999 repeticiones");
      return false;
    }

    return true;
  };

  // Validación de peso
  const validateWeight = (value: string): boolean => {
    setWeightError("");

    if (!value) {
      return true; // El peso es opcional
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      setWeightError("Debe ser un número válido");
      return false;
    }

    if (num < 0) {
      setWeightError("El peso no puede ser negativo");
      return false;
    }

    if (num > 9999) {
      setWeightError("Máximo 9999");
      return false;
    }

    return true;
  };

  // Validación de RPE
  const validateRpe = (value: string): boolean => {
    setRpeError("");

    if (!value) {
      return true; // El RPE es opcional
    }

    const num = parseInt(value);
    if (isNaN(num)) {
      setRpeError("Debe ser un número");
      return false;
    }

    if (num < 1 || num > 10) {
      setRpeError("Debe estar entre 1 y 10");
      return false;
    }

    return true;
  };

  // Manejo de cambio de repeticiones
  const handleRepsChange = (value: string) => {
    setReps(value);
    if (value) {
      validateReps(value);
    } else {
      setRepsError("");
    }
  };

  // Manejo de cambio de peso
  const handleWeightChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const sanitized = value.replace(/[^0-9.]/g, "");

    // Permitir solo un punto decimal
    const parts = sanitized.split(".");
    const finalValue =
      parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitized;

    setWeight(finalValue);
    if (finalValue) {
      validateWeight(finalValue);
    } else {
      setWeightError("");
    }
  };

  // Manejo de cambio de RPE
  const handleRpeChange = (value: string) => {
    setRpe(value);
    if (value) {
      validateRpe(value);
    } else {
      setRpeError("");
    }
  };

  // Cambiar unidad de peso (con conversión automática)
  const handleUnitChange = (newUnit: "kg" | "lbs") => {
    if (newUnit === weightUnit || !weight) {
      setWeightUnit(newUnit);
      return;
    }

    const currentWeight = parseFloat(weight);
    if (isNaN(currentWeight)) {
      setWeightUnit(newUnit);
      return;
    }

    // Convertir el peso
    let convertedWeight: number;
    if (newUnit === "kg") {
      // lbs a kg
      convertedWeight = currentWeight / 2.20462;
    } else {
      // kg a lbs
      convertedWeight = currentWeight * 2.20462;
    }

    setWeight(convertedWeight.toFixed(1));
    setWeightUnit(newUnit);
    validateWeight(convertedWeight.toFixed(1));
  };

  const handleSave = async () => {
    // Validar todos los campos
    const isRepsValid = validateReps(reps);
    const isWeightValid = validateWeight(weight);
    const isRpeValid = validateRpe(rpe);

    if (!isRepsValid || !isWeightValid || !isRpeValid) {
      return;
    }

    setIsSaving(true);

    try {
      const weightValue = weight ? parseFloat(weight) : undefined;
      const data = {
        reps_completed: parseInt(reps),
        weight_kg: weightUnit === "kg" ? weightValue : undefined,
        weight_lbs: weightUnit === "lbs" ? weightValue : undefined,
        rpe_actual: rpe ? parseInt(rpe) : undefined,
        notes: notes || undefined,
        is_warmup: isWarmup || undefined,
        is_drop_set: isDropSet || undefined,
        is_failure: isFailure || undefined,
      };

      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error al guardar la serie:", error);
      alert("Error al guardar la serie. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickRpe = (value: string) => {
    setRpe(value);
    validateRpe(value);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "md:inset-x-auto md:left-1/2 md:-translate-x-1/2", // Centrado en desktop
          "md:max-w-md md:w-full", // Ancho máximo en desktop
          "bg-gradient-to-b from-slate-900 to-slate-800",
          "rounded-t-3xl md:rounded-2xl", // Bordes redondeados en desktop
          "shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          "max-h-[85vh] md:max-h-[90vh] overflow-y-auto",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-50 mb-1">
              {exerciseName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Serie {currentSetNumber}
              </span>
              <span>•</span>
              <span>
                Target: {exercise.reps} reps @ RPE {exercise.rpe}
              </span>
            </div>
          </div>

          {/* Main Inputs */}
          <div className="space-y-4 mb-6">
            {/* Reps */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Repeticiones *
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => handleRepsChange(e.target.value)}
                onBlur={(e) => validateReps(e.target.value)}
                placeholder="0"
                min="1"
                max="999"
                className={cn(
                  "w-full px-4 py-4 text-2xl font-bold text-center",
                  "bg-slate-800/50 border-2",
                  repsError ? "border-red-500" : "border-slate-700",
                  "rounded-xl text-slate-50",
                  "focus:outline-none",
                  repsError
                    ? "focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
                  "transition-all duration-200"
                )}
                autoFocus
              />
              {repsError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {repsError}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Peso (opcional)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    onBlur={(e) => validateWeight(e.target.value)}
                    placeholder="0"
                    className={cn(
                      "w-full px-4 py-4 text-2xl font-bold text-center",
                      "bg-slate-800/50 border-2",
                      weightError ? "border-red-500" : "border-slate-700",
                      "rounded-xl text-slate-50",
                      "focus:outline-none",
                      weightError
                        ? "focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
                      "transition-all duration-200"
                    )}
                  />
                </div>
                {/* Selector de unidad mejorado */}
                <div className="flex bg-slate-800/50 border-2 border-slate-700 rounded-xl overflow-hidden min-w-[100px]">
                  <button
                    type="button"
                    onClick={() => handleUnitChange("kg")}
                    className={cn(
                      "flex-1 px-4 py-2 font-bold text-sm transition-all duration-200",
                      weightUnit === "kg"
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    )}
                  >
                    kg
                  </button>
                  <div className="w-px bg-slate-700" />
                  <button
                    type="button"
                    onClick={() => handleUnitChange("lbs")}
                    className={cn(
                      "flex-1 px-4 py-2 font-bold text-sm transition-all duration-200",
                      weightUnit === "lbs"
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    )}
                  >
                    lbs
                  </button>
                </div>
              </div>
              {weightError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {weightError}
                </p>
              )}
              {/* Indicador de conversión */}
              {weight && !weightError && parseFloat(weight) > 0 && (
                <p className="mt-2 text-xs text-slate-400 text-center">
                  ≈{" "}
                  {weightUnit === "kg"
                    ? `${(parseFloat(weight) * 2.20462).toFixed(1)} lbs`
                    : `${(parseFloat(weight) / 2.20462).toFixed(1)} kg`}
                </p>
              )}
            </div>

            {/* RPE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                RPE (Esfuerzo percibido - Opcional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={rpe}
                  onChange={(e) => handleRpeChange(e.target.value)}
                  onBlur={(e) => validateRpe(e.target.value)}
                  placeholder="0"
                  min="1"
                  max="10"
                  className={cn(
                    "flex-1 px-4 py-4 text-2xl font-bold text-center",
                    "bg-slate-800/50 border-2",
                    rpeError ? "border-red-500" : "border-slate-700",
                    "rounded-xl text-slate-50",
                    "focus:outline-none",
                    rpeError
                      ? "focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
                    "transition-all duration-200"
                  )}
                />
              </div>
              {rpeError && (
                <p className="mb-2 text-xs text-red-400 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {rpeError}
                </p>
              )}
              {/* Quick RPE buttons */}
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {[6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      handleQuickRpe(value.toString());
                      setRpeError("");
                    }}
                    className={cn(
                      "flex-1 min-w-[50px] py-2 rounded-lg font-semibold text-sm",
                      "transition-all duration-200",
                      rpe === value.toString()
                        ? "bg-green-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-3 mb-4 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
          >
            {showAdvanced
              ? "Ocultar opciones avanzadas"
              : "Mostrar opciones avanzadas"}
            <svg
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                showAdvanced && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showAdvanced && (
            <div className="space-y-4 mb-6 animate-in slide-in-from-top-2 duration-200">
              {/* Checkboxes */}
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWarmup}
                    onChange={(e) => setIsWarmup(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-slate-300">Calentamiento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDropSet}
                    onChange={(e) => setIsDropSet(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-slate-300">Drop Set</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFailure}
                    onChange={(e) => setIsFailure(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-sm text-slate-300">Al fallo</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas sobre esta serie..."
                  rows={3}
                  className={cn(
                    "w-full px-4 py-3 text-sm",
                    "bg-slate-800/50 border-2 border-slate-700",
                    "rounded-xl text-slate-50 placeholder-slate-500",
                    "focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
                    "transition-all duration-200 resize-none"
                  )}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={cn(
                "flex-1 py-4 rounded-xl font-semibold",
                "bg-slate-800 text-slate-300",
                "hover:bg-slate-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                isSaving || !reps || !!repsError || !!weightError || !!rpeError
              }
              className={cn(
                "flex-1 py-4 rounded-xl font-semibold",
                "bg-gradient-to-r from-amber-500 to-amber-600",
                "text-white shadow-lg shadow-amber-500/25",
                "hover:from-amber-600 hover:to-amber-700",
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
                  Guardar Serie
                </>
              )}
            </button>
          </div>

          {/* Last set info */}
          {lastSet && (
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Última serie:</div>
              <div className="text-sm text-slate-300">
                {lastSet.reps_completed} reps
                {lastSet.weight_kg && ` × ${lastSet.weight_kg} kg`}
                {lastSet.weight_lbs && ` × ${lastSet.weight_lbs} lbs`}
                {lastSet.rpe_actual && ` @ RPE ${lastSet.rpe_actual}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
