import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Dumbbell,
  Clock,
  DollarSign,
  Award,
  Loader2,
  UserPlus,
  CheckCircle,
  XCircle,
  BadgeCheck,
} from 'lucide-react';
import { getCoachPublicProfile, requestConnection, getMyConnections } from '../../services/coachDashboard';
import { PageHeader } from '../../components/PageHeader';

type ConnectionStatus = 'none' | 'pending' | 'active' | 'rejected';

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  none: { label: '', className: '', icon: null },
  pending: {
    label: 'Solicitud enviada',
    className: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
    icon: <Clock size={14} />,
  },
  active: {
    label: 'Conectado',
    className: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
    icon: <CheckCircle size={14} />,
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-400/10 text-red-400 border border-red-400/30',
    icon: <XCircle size={14} />,
  },
};

export const CoachProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [coach, setCoach] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getCoachPublicProfile(id), getMyConnections()])
      .then(([profileData, connections]) => {
        setCoach(profileData.coach);
        const rel = (connections as any[]).find(
          (c) => c.coach_id === id || c.coaches?.id === id,
        );
        setConnectionStatus((rel?.status as ConnectionStatus) ?? 'none');
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConnect = async () => {
    if (!id) return;
    setRequesting(true);
    try {
      await requestConnection(id);
      setConnectionStatus('pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud.');
    } finally {
      setRequesting(false);
    }
  };

  const coachName = coach
    ? [coach.users?.first_name, coach.users?.last_name].filter(Boolean).join(' ') || 'Entrenador'
    : '';

  return (
    <div className="min-h-screen bg-stone-950 pb-20">
      <PageHeader title={coachName || 'Perfil de coach'} />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-lime-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && coach && (
          <>
            {/* Avatar + nombre */}
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center shrink-0">
                  <Dumbbell size={28} className="text-lime-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-white truncate">{coachName}</h2>
                  {coach.specialization && (
                    <p className="text-sm text-lime-400 font-medium">{coach.specialization}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                {coach.years_experience != null && (
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <Clock size={14} className="text-stone-500" />
                    <span>{coach.years_experience} años de experiencia</span>
                  </div>
                )}
                {coach.hourly_rate != null && (
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <DollarSign size={14} className="text-stone-500" />
                    <span>${coach.hourly_rate}/hr</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {coach.bio && (
                <p className="text-sm text-stone-400 leading-relaxed">{coach.bio}</p>
              )}

              {/* Certifications */}
              {Array.isArray(coach.certifications) && coach.certifications.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    <Award size={12} />
                    Certificaciones
                  </p>
                  <ul className="space-y-1.5">
                    {coach.certifications.map((cert: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-300">
                        <BadgeCheck size={13} className="text-lime-400 shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
              {connectionStatus === 'none' ? (
                <button
                  onClick={handleConnect}
                  disabled={requesting}
                  className="w-full py-3 rounded-xl text-sm font-bold text-stone-950 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                >
                  {requesting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Solicitar entrenamiento
                    </>
                  )}
                </button>
              ) : (
                <div
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${STATUS_CONFIG[connectionStatus].className}`}
                >
                  {STATUS_CONFIG[connectionStatus].icon}
                  {STATUS_CONFIG[connectionStatus].label}
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !coach && !error && (
          <div className="bg-stone-900 rounded-2xl p-8 border border-stone-800 text-center text-stone-400">
            Coach no encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
