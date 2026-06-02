import { useMemo } from "react";
import { CheckCircle2, Circle, Flame } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExerciseStatus {
  name: string;
  completed: boolean;
}

interface WorkoutProgressProps {
  exercises: ExerciseStatus[];
  dayName: string; // "PUSH" | "PULL" | "LEG" | "DESCANSO"
  sessionStarted?: boolean;
  estimatedMinutes?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  PUSH: { from: "#a3e635", to: "#84cc16", glow: "rgba(163,230,53,0.35)" },
  PULL: { from: "#8b5cf6", to: "#ec4899", glow: "rgba(236,72,153,0.3)" },
  LEG:  { from: "#10b981", to: "#06b6d4", glow: "rgba(16,185,129,0.3)" },
  DESCANSO: { from: "#64748b", to: "#475569", glow: "rgba(100,116,139,0.2)" },
};

function getEncouragement(pct: number): string {
  if (pct === 0) return "¡Empecemos!";
  if (pct < 25) return "¡Buen comienzo!";
  if (pct < 50) return "¡Sigue así!";
  if (pct < 75) return "¡Más de la mitad!";
  if (pct < 100) return "¡Casi terminas!";
  return "¡Workout completado! 🔥";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkoutProgress({
  exercises,
  dayName,
  sessionStarted = false,
  estimatedMinutes,
}: WorkoutProgressProps) {
  const completed = useMemo(
    () => exercises.filter((e) => e.completed).length,
    [exercises]
  );
  const total = exercises.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const colors = DAY_COLORS[dayName] ?? DAY_COLORS["PUSH"];

  if (!sessionStarted && pct === 0) return null;

  return (
    <div
      className="sticky top-0 z-30 w-full"
      style={{
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          {/* Label + encouragement */}
          <div className="flex items-center gap-2">
            <Flame
              size={15}
              style={{ color: colors.from }}
              className={pct > 0 ? "animate-pulse" : "opacity-40"}
            />
            <span className="text-xs font-semibold text-stone-300">
              {getEncouragement(pct)}
            </span>
          </div>

          {/* Counter */}
          <span className="text-xs font-bold tabular-nums" style={{ color: colors.from }}>
            {completed}/{total} ejercicios
            {estimatedMinutes && completed < total && (
              <span className="text-stone-500 font-normal ml-1">
                · ~{Math.round(estimatedMinutes * (1 - pct / 100))} min restantes
              </span>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: "6px", background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
              boxShadow: pct > 0 ? `0 0 10px ${colors.glow}` : "none",
            }}
          />
        </div>

        {/* Exercise dots */}
        {total <= 12 && (
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
            {exercises.map((ex, i) => (
              <div
                key={i}
                title={ex.name}
                className="flex-shrink-0 transition-all duration-300"
              >
                {ex.completed ? (
                  <CheckCircle2
                    size={14}
                    style={{ color: colors.from }}
                  />
                ) : (
                  <Circle
                    size={14}
                    className="text-stone-600"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Completion banner */}
        {pct === 100 && (
          <div
            className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, ${colors.from}25, ${colors.to}25)`,
              border: `1px solid ${colors.from}40`,
              color: colors.from,
            }}
          >
            <span>🎯</span>
            <span>¡Workout completado! Excelente trabajo</span>
          </div>
        )}
      </div>
    </div>
  );
}
