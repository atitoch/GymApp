import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { getMyCoachProfile, updateMyCoachProfile } from '../../services/coachDashboard';

export const CoachProfileEditor: React.FC = () => {
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCoachProfile()
      .then((p) => {
        setBio(p.bio ?? '');
        setSpecialization(p.specialization ?? '');
        setYearsExperience(p.years_experience != null ? String(p.years_experience) : '');
        setHourlyRate(p.hourly_rate != null ? String(p.hourly_rate) : '');
        setCertifications(p.certifications ?? []);
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateMyCoachProfile({
        bio: bio.trim() || undefined,
        specialization: specialization.trim() || undefined,
        years_experience: yearsExperience ? Number(yearsExperience) : undefined,
        hourly_rate: hourlyRate ? Number(hourlyRate) : undefined,
        certifications: certifications.filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const updateCert = (i: number, val: string) =>
    setCertifications((prev) => prev.map((c, idx) => idx === i ? val : c));
  const removeCert = (i: number) =>
    setCertifications((prev) => prev.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 size={28} className="text-lime-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-black flex-1">Mi perfil de entrenador</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: saved ? '#86efac' : 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Especialización */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Especialización</label>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Ej. Fuerza y acondicionamiento"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Años de experiencia</label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="0"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Tarifa por hora ($)</label>
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="0"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntale a tus clientes quién eres y cuál es tu enfoque de entrenamiento..."
            rows={4}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 resize-none focus:outline-none focus:border-lime-400"
          />
        </div>

        {/* Certificaciones */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Certificaciones</label>
            <button
              onClick={() => setCertifications((prev) => [...prev, ''])}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-lime-400 transition-colors"
            >
              <Plus size={13} /> Agregar
            </button>
          </div>
          {certifications.length === 0 && (
            <p className="text-xs text-stone-600 italic">Sin certificaciones agregadas</p>
          )}
          {certifications.map((cert, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={cert}
                onChange={(e) => updateCert(i, e.target.value)}
                placeholder="Ej. NSCA-CSCS, ACE Personal Trainer..."
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
              />
              <button onClick={() => removeCert(i)} className="p-2 text-stone-500 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
