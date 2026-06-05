import { useState, useEffect, useCallback, useRef } from "react";
import { X, SkipForward, Plus, Minus, Bell, BellOff } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
  exerciseName?: string;
  onComplete?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (secs: number): string => {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  const prefix = secs < 0 ? "+" : "";
  return `${prefix}${m}:${s.toString().padStart(2, "0")}`;
};

const circumference = 2 * Math.PI * 54; // radio 54 del SVG

// ─── Component ───────────────────────────────────────────────────────────────

export default function RestTimer({
  isOpen,
  onClose,
  defaultSeconds = 90,
  exerciseName,
  onComplete,
}: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [overtime, setOvertime] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setTotalSeconds(defaultSeconds);
      setRemaining(defaultSeconds);
      setIsRunning(true);
      setOvertime(false);
    }
  }, [isOpen, defaultSeconds]);

  // Web Audio API beep
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Ignore AudioContext errors
    }
  }, [soundEnabled]);

  // Use refs so the interval always sees the latest callbacks without restarting
  const playBeepRef = useRef(playBeep);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { playBeepRef.current = playBeep; }, [playBeep]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Tick
  useEffect(() => {
    if (!isRunning || !isOpen) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === 1) {
          playBeepRef.current();
          setOvertime(true);
          onCompleteRef.current?.();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isOpen]);

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  };

  const handleAdjust = (delta: number) => {
    setTotalSeconds((prev) => Math.max(10, prev + delta));
    setRemaining((prev) => Math.max(1, prev + delta));
  };

  const progress = overtime
    ? 1
    : Math.max(0, remaining / totalSeconds);

  const strokeDashoffset = circumference * (1 - progress);

  // Color según tiempo restante
  const timerColor =
    overtime
      ? "#ef4444"
      : remaining <= 10
      ? "#f59e0b"
      : "#a3e635";

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      {/* Panel */}
      <div
        className="relative w-full sm:w-96 rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1c1917 0%, #1c1917 100%)",
          border: "1px solid rgba(163,230,53,0.3)",
          boxShadow: "0 0 60px rgba(163,230,53,0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
              Descanso
            </p>
            {exerciseName && (
              <p className="text-sm text-stone-400 mt-0.5 truncate max-w-48">
                Siguiente: {exerciseName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="flex flex-col items-center py-8">
          <div className="relative w-36 h-36">
            {/* SVG progress ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              {/* Progress */}
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke={timerColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-black tabular-nums leading-none"
                style={{
                  color: timerColor,
                  fontFeatureSettings: '"tnum"',
                  textShadow: `0 0 20px ${timerColor}60`,
                  transition: "color 0.3s",
                }}
              >
                {formatTime(remaining)}
              </span>
              {overtime && (
                <span className="text-xs text-red-400 font-semibold mt-1 animate-pulse">
                  EXTRA
                </span>
              )}
            </div>
          </div>

          {/* Adjust buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => handleAdjust(-15)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
            >
              <Minus size={14} /> 15s
            </button>
            <div className="text-stone-600 text-xs">ajustar</div>
            <button
              onClick={() => handleAdjust(15)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
            >
              <Plus size={14} /> 15s
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 flex gap-3">
          {/* Skip */}
          <button
            onClick={handleSkip}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a3e635, #84cc16)",
              boxShadow: "0 4px 20px rgba(163,230,53,0.4)",
              color: "white",
            }}
          >
            <SkipForward size={18} />
            Saltar descanso
          </button>
        </div>

        {/* Progress dots (presets rápidos) */}
        <div className="flex justify-center gap-2 pb-6">
          {[60, 90, 120, 180].map((s) => (
            <button
              key={s}
              onClick={() => {
                setTotalSeconds(s);
                setRemaining(s);
                setOvertime(false);
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: totalSeconds === s
                  ? "rgba(163,230,53,0.4)"
                  : "rgba(255,255,255,0.05)",
                color: totalSeconds === s ? "#a5b4fc" : "#64748b",
                border: totalSeconds === s
                  ? "1px solid rgba(163,230,53,0.5)"
                  : "1px solid transparent",
              }}
            >
              {s < 60 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
