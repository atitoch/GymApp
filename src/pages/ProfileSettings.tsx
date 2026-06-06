import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  LogOut,
  Check,
  Loader2,
  ChevronRight,
  Dumbbell,
  AlertCircle,
  Ruler,
  Camera,
  Palette,
} from 'lucide-react';
import * as profileService from '../services/profile';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../theme';

// ─── Types (mapeados a public.users) ─────────────────────────────────────────

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  weight_unit: 'kg' | 'lbs';
  notify_rest_timer: boolean;
  notify_workout_reminder: boolean;
  reminder_time: string;
  default_rest_seconds: number;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
  gender: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const ACCENT_THEMES = [
  { id: 'default', label: 'Lima', color: '#a3e635' },
  { id: 'coach1',  label: 'Cielo', color: '#38bdf8' },
  { id: 'coach2',  label: 'Fucsia', color: '#e879f9' },
  { id: 'coach3',  label: 'Naranja', color: '#fb923c' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  url,
  name,
  size = 80,
}: {
  url?: string | null;
  name?: string;
  size?: number;
}) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';
  if (url)
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg,#a3e635,#84cc16)',
        fontSize: size * 0.3,
      }}
    >
      {initials}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={14} className="text-lime-400" />
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-500">
          {title}
        </h2>
      </div>
      <div
        className="rounded-2xl overflow-hidden divide-y divide-white/[0.04]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const Divider = () => (
  <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
);

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3 min-w-0">
      <span className="text-sm text-stone-400 shrink-0">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-stone-600 outline-none text-right truncate focus:truncate-none"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span className="text-sm text-stone-400 flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          min={min}
          max={max}
          step={step}
          className="w-20 bg-transparent text-sm text-white outline-none text-right"
          placeholder="—"
        />
        {unit && <span className="text-xs text-stone-500">{unit}</span>}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm text-stone-300 font-medium">{label}</p>
        {description && (
          <p className="text-xs text-stone-600 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{
          background: value
            ? 'linear-gradient(135deg,#a3e635,#84cc16)'
            : 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300"
          style={{ left: value ? 'calc(100% - 20px)' : '4px' }}
        />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span className="text-sm text-stone-400 flex-1">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-white outline-none text-right"
        style={{ background: 'transparent' }}
      >
        <option value="" style={{ background: '#1c1917' }}>
          Sin especificar
        </option>
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: '#1c1917' }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RestAdjust({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span className="text-sm text-stone-400 flex-1">
        Descanso por defecto
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(15, value - 15))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all font-bold text-lg"
        >
          −
        </button>
        <span className="text-sm font-bold text-white tabular-nums w-12 text-center">
          {value}s
        </span>
        <button
          onClick={() => onChange(Math.min(600, value + 15))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all font-bold text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const data = await profileService.getUserProfile();

        if (data) {
          // El perfil del servicio ya coincide con la estructura del backend
          setProfile({
            id: data.id,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || user.email || '',
            bio: data.bio ?? null,
            avatar_url: data.avatar_url ?? null,
            weight_unit: data.weight_unit,
            notify_rest_timer: data.notify_rest_timer,
            notify_workout_reminder: data.notify_workout_reminder,
            reminder_time: data.reminder_time || '09:00',
            default_rest_seconds: data.default_rest_seconds,
            height_cm: data.height_cm ?? null,
            weight_kg: data.weight_kg ?? null,
            fitness_goal: data.fitness_goal ?? null,
            gender: data.gender ?? null,
          });
        } else {
          // Si no existe perfil, crear uno básico con datos del usuario
          setProfile({
            id: user.id,
            first_name: user.name?.split(' ')[0] || '',
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            bio: null,
            avatar_url: null,
            weight_unit: 'kg',
            notify_rest_timer: true,
            notify_workout_reminder: false,
            reminder_time: '09:00',
            default_rest_seconds: 90,
            height_cm: null,
            weight_kg: null,
            fitness_goal: null,
            gender: null,
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error al cargar el perfil. Verifica tu conexión.');
        // Crear perfil temporal con datos del usuario
        setProfile({
          id: user.id,
          first_name: user.name?.split(' ')[0] || '',
          last_name: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          bio: null,
          avatar_url: null,
          weight_unit: 'kg',
          notify_rest_timer: true,
          notify_workout_reminder: false,
          reminder_time: '09:00',
          default_rest_seconds: 90,
          height_cm: null,
          weight_kg: null,
          fitness_goal: null,
          gender: null,
        });
      }
      setLoading(false);
    }
    load();
  }, [navigate, user?.id]);

  // Auto-save con debounce 1s
  const updateField = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await profileService.updateUserProfile({
          [field]: value,
        } as profileService.UpdateProfileData);
        if (mountedRef.current) setSaveStatus('saved');
      } catch (err) {
        console.error('Error updating profile:', err);
        if (mountedRef.current) setSaveStatus('error');
      }
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) setSaveStatus('idle');
      }, 2500);
    }, 1000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    try {
      const publicUrl = await profileService.uploadAvatar(file);
      await profileService.updateUserProfile({ avatar_url: publicUrl });
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch {
      // silently ignore upload errors
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 size={32} className="text-lime-400 animate-spin" />
      </div>
    );

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : '';

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 100%)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(12,10,9,0.90)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-white">Perfil</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={12} className="animate-spin text-lime-400" />
                <span className="text-stone-500">Guardando...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-500">Guardado</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400">Error</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {error && (
          <div
            className="rounded-2xl p-4 flex gap-2 items-center"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Avatar */}
        {profile && (
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group"
              title="Cambiar foto"
            >
              <Avatar url={profile.avatar_url} name={fullName} size={88} />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {uploadingAvatar
                  ? <Loader2 size={20} className="text-white animate-spin" />
                  : <Camera size={20} className="text-white" />}
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="text-center">
              <p className="text-base font-bold text-white">
                {fullName || 'Sin nombre'}
              </p>
              <p className="text-sm text-stone-500">{profile.email}</p>
            </div>
          </div>
        )}

        {profile && (
          <Section title="Información personal" icon={User}>
            <InputField
              label="Nombre"
              value={profile.first_name}
              onChange={(v) => updateField('first_name', v)}
              placeholder="Tu nombre"
              maxLength={60}
            />
            <Divider />
            <InputField
              label="Apellido"
              value={profile.last_name}
              onChange={(v) => updateField('last_name', v)}
              placeholder="Tu apellido"
              maxLength={60}
            />
            <Divider />
            <div className="px-4 py-3">
              <p className="text-sm text-stone-400 mb-2">Bio</p>
              <textarea
                value={profile.bio ?? ''}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti y tus objetivos..."
                maxLength={200}
                rows={2}
                className="w-full bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none resize-none leading-relaxed"
              />
              <p className="text-xs text-stone-700 text-right">
                {(profile.bio ?? '').length}/200
              </p>
            </div>
          </Section>
        )}

        {profile && (
          <Section title="Datos físicos" icon={Ruler}>
            <NumberField
              label="Altura"
              value={profile.height_cm}
              onChange={(v) => updateField('height_cm', v)}
              unit="cm"
              min={100}
              max={250}
            />
            <Divider />
            <NumberField
              label="Peso"
              value={profile.weight_kg}
              onChange={(v) => updateField('weight_kg', v)}
              unit="kg"
              min={30}
              max={300}
              step={0.1}
            />
            <Divider />
            <SelectField
              label="Género"
              value={profile.gender ?? ''}
              options={[
                { value: 'male', label: 'Masculino' },
                { value: 'female', label: 'Femenino' },
                { value: 'other', label: 'Otro' },
              ]}
              onChange={(v) => updateField('gender', v)}
            />
            <Divider />
            <SelectField
              label="Objetivo"
              value={profile.fitness_goal ?? ''}
              options={[
                { value: 'muscle_gain', label: 'Ganar músculo' },
                { value: 'fat_loss', label: 'Perder grasa' },
                { value: 'strength', label: 'Ganar fuerza' },
                { value: 'endurance', label: 'Resistencia' },
                { value: 'maintenance', label: 'Mantenimiento' },
              ]}
              onChange={(v) => updateField('fitness_goal', v)}
            />
          </Section>
        )}

        {profile && (
          <Section title="Entrenamiento" icon={Dumbbell}>
            <SelectField
              label="Unidad de peso"
              value={profile.weight_unit}
              options={[
                { value: 'kg', label: 'Kilogramos (kg)' },
                { value: 'lbs', label: 'Libras (lbs)' },
              ]}
              onChange={(v) => updateField('weight_unit', v as 'kg' | 'lbs')}
            />
            <Divider />
            <RestAdjust
              value={profile.default_rest_seconds}
              onChange={(v) => updateField('default_rest_seconds', v)}
            />
          </Section>
        )}

        {profile && (
          <Section title="Notificaciones" icon={Bell}>
            <ToggleField
              label="Sonido timer de descanso"
              description="Beep al terminar el descanso"
              value={profile.notify_rest_timer}
              onChange={(v) => updateField('notify_rest_timer', v)}
            />
            <Divider />
            <ToggleField
              label="Recordatorio de entrenamiento"
              description="Notificación diaria para no saltarte el gym"
              value={profile.notify_workout_reminder}
              onChange={(v) => updateField('notify_workout_reminder', v)}
            />
            {profile.notify_workout_reminder && (
              <>
                <Divider />
                <InputField
                  label="Hora del aviso"
                  value={profile.reminder_time}
                  onChange={(v) => updateField('reminder_time', v)}
                  type="time"
                />
              </>
            )}
          </Section>
        )}

        {(user?.role === 'user' || user?.coachStatus === 'pending') && (
          <Section title="Entrenador" icon={Dumbbell}>
            <button
              onClick={() => navigate('/apply-as-coach')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <Dumbbell size={16} className="text-lime-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-300">
                  Conviértete en entrenador
                </p>
                {user?.coachStatus === 'pending' && (
                  <p className="text-xs text-yellow-400">Solicitud pendiente</p>
                )}
              </div>
              <ChevronRight size={14} className="text-stone-600" />
            </button>
          </Section>
        )}

        {/* Color de acento — UI oculta temporalmente, pendiente implementación completa
        <Section title="Apariencia" icon={Palette}>
          <div className="px-4 py-3 space-y-3">
            <p className="text-sm text-stone-400">Color de acento</p>
            <div className="flex gap-3">
              {ACCENT_THEMES.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  title={label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-9 h-9 rounded-full transition-all"
                    style={{
                      background: color,
                      boxShadow: currentTheme.name === id ? `0 0 0 3px rgba(255,255,255,0.15), 0 0 0 2px ${color}` : 'none',
                      transform: currentTheme.name === id ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                  <span className="text-[10px] text-stone-500">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>
        */}

        <Section title="Cuenta" icon={Shield}>
          <button
            onClick={() => {
              alert(
                'Función de cambio de contraseña: implementa el endpoint POST /api/auth/reset-password en tu backend.',
              );
            }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
          >
            <Shield size={16} className="text-stone-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-300">
                Cambiar contraseña
              </p>
              <p className="text-xs text-stone-600">Próximamente</p>
            </div>
            <ChevronRight size={14} className="text-stone-600" />
          </button>
        </Section>

        {/* Logout */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          {!logoutConfirm ? (
            <button
              onClick={() => setLogoutConfirm(true)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={16} className="text-red-400" />
              <span className="text-sm font-medium text-red-400 flex-1">
                Cerrar sesión
              </span>
              <ChevronRight size={14} className="text-red-600" />
            </button>
          ) : (
            <div className="px-4 py-4 flex flex-col gap-3">
              <p className="text-sm text-stone-400 text-center">
                ¿Seguro que quieres cerrar sesión?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-stone-700 pb-4">
          GymTrack v1.0.0 · Hecho con 💙 para atletas serios
        </p>
      </div>
    </div>
  );
}
