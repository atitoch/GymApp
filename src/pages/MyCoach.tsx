import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  DollarSign,
  MessageSquare,
  Calendar,
  BadgeCheck,
  Award,
  Loader2,
  Users,
  UserMinus,
} from 'lucide-react';
import { getMyCoach, disconnectFromCoach, type MyCoachData } from '../services/coachDashboard';

const COMMENT_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  nutrition: 'Nutrición',
  training: 'Entrenamiento',
  progress: 'Progreso',
  technique: 'Técnica',
  motivation: 'Motivación',
};

export const MyCoach: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MyCoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    getMyCoach()
      .then(setData)
      .catch(() => setData({ coach: null, comments: [], assigned_routine: null }))
      .finally(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectFromCoach();
      setData((prev) => prev ? { ...prev, coach: null, assigned_routine: null } : prev);
      setConfirmDisconnect(false);
    } catch {} finally {
      setDisconnecting(false);
    }
  };

  const coach = data?.coach;
  const coachName = coach
    ? [coach.users?.first_name, coach.users?.last_name].filter(Boolean).join(' ') || 'Entrenador'
    : '';

  return (
    <div className="min-h-screen bg-stone-950 pb-20">
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(12,10,9,0.90)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-white">Mi entrenador</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-lime-400 animate-spin" />
          </div>
        )}

        {!loading && !coach && (
          <div className="bg-stone-900 rounded-2xl p-8 border border-stone-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center mx-auto">
              <Users size={24} className="text-stone-500" />
            </div>
            <div>
              <p className="text-white font-bold">Sin entrenador asignado</p>
              <p className="text-sm text-stone-400 mt-1">Explora los coaches disponibles y solicita conexión.</p>
            </div>
            <Link
              to="/coaches"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-stone-950"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              Ver coaches
            </Link>
          </div>
        )}

        {!loading && coach && (
          <>
            {/* Perfil del coach */}
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
                  {coach.connected_since && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      Conectado desde {new Date(coach.connected_since).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {coach.users?.id && (
                  <button
                    onClick={() => navigate(`/messages/${coach.users!.id}`, { state: { partnerName: coachName } })}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                  >
                    <MessageSquare size={15} />
                    Mensaje
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                {coach.years_experience != null && (
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <Clock size={13} className="text-stone-500" />
                    {coach.years_experience} años exp.
                  </div>
                )}
                {coach.hourly_rate != null && (
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <DollarSign size={13} className="text-stone-500" />
                    ${coach.hourly_rate}/hr
                  </div>
                )}
              </div>

              {coach.bio && (
                <p className="text-sm text-stone-400 leading-relaxed">{coach.bio}</p>
              )}

              {Array.isArray(coach.certifications) && coach.certifications.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    <Award size={11} /> Certificaciones
                  </p>
                  <ul className="space-y-1">
                    {coach.certifications.map((c: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-300">
                        <BadgeCheck size={12} className="text-lime-400 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rutina asignada */}
            {data?.assigned_routine ? (
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                  <Calendar size={11} /> Rutina asignada
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{data.assigned_routine.name}</p>
                    <p className="text-sm text-stone-400">
                      {data.assigned_routine.total_days
                        ? `${data.assigned_routine.total_days} días`
                        : 'Sin duración definida'}
                      {data.assigned_routine.is_cyclic && ' · Cíclica'}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    Ver rutina
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5 mb-2">
                  <Calendar size={11} /> Rutina asignada
                </p>
                <p className="text-sm text-stone-500">Tu coach aún no te ha asignado una rutina.</p>
              </div>
            )}

            {/* Terminar conexión */}
            <div className="bg-stone-900 rounded-2xl p-5 border border-red-900/40">
              <button
                onClick={() => setConfirmDisconnect(true)}
                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                <UserMinus size={15} />
                Terminar conexión con este coach
              </button>
            </div>

            {/* Modal de confirmación — desconectar coach */}
            {confirmDisconnect && (
              <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <div
                  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                  onClick={() => !disconnecting && setConfirmDisconnect(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-500/15">
                        <UserMinus size={20} className="text-red-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">¿Terminar conexión?</h3>
                    </div>
                    <p className="text-sm text-stone-400 leading-relaxed">
                      Esto finalizará la relación con tu coach y{' '}
                      <strong className="text-stone-200">perderás la rutina asignada</strong>.
                      No podrás deshacer esta acción.
                    </p>
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setConfirmDisconnect(false)}
                        disabled={disconnecting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {disconnecting
                          ? <Loader2 size={15} className="animate-spin" />
                          : <><UserMinus size={15} /> Terminar</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Comentarios del coach */}
            <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <MessageSquare size={11} /> Comentarios de tu coach
              </p>
              {data?.comments && data.comments.length > 0 ? (
                <ul className="space-y-3">
                  {data.comments.map((c) => (
                    <li key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-lime-400">
                          {COMMENT_TYPE_LABELS[c.comment_type] ?? c.comment_type}
                        </span>
                        <span className="text-xs text-stone-600">
                          {new Date(c.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">{c.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-500">Tu coach no ha dejado comentarios todavía.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
