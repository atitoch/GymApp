import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CreditCard,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { getCoachPublicProfile, requestConnection, getMyConnections, getCoachPlans, type CoachPlan } from '../../services/coachDashboard';
import { PageHeader } from '../../components/PageHeader';
import { PLAN_INTERVAL_SUFFIX, fmtPlanPrice } from '../../utils/plans';
import { Avatar } from '../../components/Avatar';

type ConnectionStatus = 'none' | 'pending' | 'active' | 'rejected' | 'ended';
const KNOWN_STATUSES: ConnectionStatus[] = ['pending', 'active', 'rejected', 'ended'];
const normalizeStatus = (s?: string): ConnectionStatus =>
  KNOWN_STATUSES.includes(s as ConnectionStatus) ? (s as ConnectionStatus) : 'none';

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
  ended: {
    label: 'Vinculación finalizada',
    className: 'bg-stone-800 text-stone-500 border border-stone-700',
    icon: <XCircle size={14} />,
  },
};

export const CoachProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [coach, setCoach] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCoachPublicProfile(id),
      getMyConnections(),
      getCoachPlans(id).catch(() => []),
    ])
      .then(([profileData, connections, coachPlans]) => {
        setCoach(profileData.coach);
        setDocuments((profileData as any).documents ?? []);
        setPlans(coachPlans);
        const rel = (connections as any[]).find(
          (c) => c.coach_id === id || c.coaches?.id === id,
        );
        setConnectionStatus(normalizeStatus(rel?.status));
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConnect = async () => {
    if (!id) return;
    setRequesting(true);
    setError(null);
    try {
      await requestConnection(id, selectedPlanId ?? undefined);
      setConnectionStatus('pending');
    } catch (err) {
      // Backend may process the request but return a non-2xx response.
      // Re-check actual connection state before showing an error.
      try {
        const connections = await getMyConnections();
        const rel = (connections as any[]).find((c) => c.coach_id === id || c.coaches?.id === id);
        if (rel?.status === 'pending') {
          setConnectionStatus('pending');
          return;
        }
      } catch {}
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud.');
    } finally {
      setRequesting(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  // Si el coach publicó planes, el cliente debe elegir uno para solicitar
  const needsPlanSelection = plans.length > 0 && !selectedPlanId;

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
                {coach.users?.avatar_url ? (
                  <Avatar url={coach.users.avatar_url} name={coachName} size={64} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center shrink-0">
                    <Dumbbell size={28} className="text-lime-400" />
                  </div>
                )}
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

            {/* Documentos verificados por admin */}
            {documents.length > 0 && (
              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-lime-400" />
                  Documentos verificados
                </p>
                <ul className="space-y-2">
                  {documents.map((doc: any) => {
                    const label = doc.label || (
                      doc.document_type === 'certification' ? 'Certificación de entrenador'
                      : doc.document_type === 'id' ? 'Identificación oficial'
                      : doc.document_type === 'diploma' ? 'Diploma / Curso complementario'
                      : doc.file_name ?? doc.document_type
                    );
                    return (
                      <li key={doc.id}>
                        {doc.signed_url ? (
                          <a
                            href={doc.signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-stone-300 hover:text-lime-400 transition-colors group"
                          >
                            <FileText size={14} className="text-lime-400 shrink-0" />
                            <span className="flex-1 truncate">{label}</span>
                            <CheckCircle size={12} className="text-lime-400 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <FileText size={14} className="shrink-0" />
                            <span className="truncate">{label}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Planes */}
            {plans.length > 0 && (
              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                  <CreditCard size={12} />
                  Planes de entrenamiento
                </p>
                <div className="space-y-2">
                  {plans.map(plan => {
                    const selectable = connectionStatus === 'none' || connectionStatus === 'ended';
                    const selected = selectedPlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => selectable && setSelectedPlanId(selected ? null : plan.id)}
                        disabled={!selectable}
                        className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                          selected
                            ? 'border-lime-400 bg-lime-400/5'
                            : 'border-stone-700 hover:border-stone-500'
                        } ${!selectable ? 'cursor-default opacity-80' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{plan.name}</p>
                            {plan.description && (
                              <p className="text-xs text-stone-400 mt-1 leading-relaxed">{plan.description}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-lime-400 font-black">
                              {fmtPlanPrice(plan.price, plan.currency)}
                              <span className="text-[10px] font-medium text-stone-500">{PLAN_INTERVAL_SUFFIX[plan.interval]}</span>
                            </p>
                            {selectable && (
                              <div className={`mt-1.5 ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selected ? 'border-lime-400 bg-lime-400' : 'border-stone-600'
                              }`}>
                                {selected && <CheckCircle size={10} className="text-stone-950" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(connectionStatus === 'none' || connectionStatus === 'ended') && (
                  <p className="text-[11px] text-stone-500">
                    Elige un plan para enviar tu solicitud. El pago se acuerda directamente con el coach.
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-3">
              {(connectionStatus === 'none' || connectionStatus === 'ended') ? (
                <>
                  {connectionStatus === 'ended' && (
                    <div className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${STATUS_CONFIG.ended.className}`}>
                      {STATUS_CONFIG.ended.icon}
                      {STATUS_CONFIG.ended.label}
                    </div>
                  )}
                  {plans.length > 0 && (
                    <p className="text-xs text-center text-stone-500">
                      {selectedPlan ? (
                        <>
                          Plan elegido: <strong className="text-white">{selectedPlan.name}</strong>{' — '}
                          <span className="text-lime-400 font-bold">
                            {fmtPlanPrice(selectedPlan.price, selectedPlan.currency)}{PLAN_INTERVAL_SUFFIX[selectedPlan.interval]}
                          </span>
                        </>
                      ) : (
                        'Elige un plan arriba para continuar.'
                      )}
                    </p>
                  )}
                  <button
                    onClick={handleConnect}
                    disabled={requesting || needsPlanSelection}
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
                        {connectionStatus === 'ended' ? 'Solicitar de nuevo' : 'Enviar solicitud'}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div
                    className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${STATUS_CONFIG[connectionStatus].className}`}
                  >
                    {STATUS_CONFIG[connectionStatus].icon}
                    {STATUS_CONFIG[connectionStatus].label}
                  </div>
                  {connectionStatus === 'pending' && (
                    <>
                      <p className="text-xs text-stone-500 text-center">
                        {coachName} revisará tu solicitud. Te avisaremos por mensaje cuando la acepte.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/coaches')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-300 border border-stone-700 hover:bg-stone-800 transition-colors"
                        >
                          Ver más coaches
                        </button>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-300 border border-stone-700 hover:bg-stone-800 transition-colors"
                        >
                          Ir a mi inicio
                        </button>
                      </div>
                    </>
                  )}
                  {connectionStatus === 'active' && (
                    <button
                      onClick={() => navigate('/my-coach')}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                    >
                      Ir a Mi coach →
                    </button>
                  )}
                </>
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
