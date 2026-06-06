import React, { useState } from 'react';
import { Dumbbell, Target, ChevronRight, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../services/profile';

const GOALS = [
  { value: 'lose_weight', label: 'Bajar de peso' },
  { value: 'build_muscle', label: 'Ganar músculo' },
  { value: 'improve_fitness', label: 'Mejorar condición física' },
  { value: 'maintain', label: 'Mantener el peso' },
  { value: 'athletic', label: 'Rendimiento atlético' },
];

interface Props {
  onComplete: (name: string) => void;
}

export const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        fitness_goal: goal || undefined,
      });
      onComplete(firstName.trim() || 'Usuario');
    } catch {
      onComplete(firstName.trim() || 'Usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: '#1c1917', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-stone-800">
          <div
            className="h-1 bg-lime-400 transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                  <Dumbbell size={20} className="text-lime-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg">¡Bienvenido a GymApp!</p>
                  <p className="text-stone-500 text-sm">Cuéntanos tu nombre</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre *"
                  autoFocus
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400"
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido (opcional)"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!firstName.trim()}
                className="w-full py-3 rounded-2xl text-sm font-bold text-stone-950 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                  <Target size={20} className="text-lime-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg">¿Cuál es tu objetivo?</p>
                  <p className="text-stone-500 text-sm">Opcional, puedes cambiarlo luego</p>
                </div>
              </div>

              <div className="space-y-2">
                {GOALS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGoal(value)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: goal === value ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.04)',
                      border: goal === value ? '1px solid rgba(163,230,53,0.35)' : '1px solid rgba(255,255,255,0.06)',
                      color: goal === value ? '#a3e635' : '#d6d3d1',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-3 rounded-2xl text-sm font-bold text-stone-950 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Empezar →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
