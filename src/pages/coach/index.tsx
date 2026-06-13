import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Clock, CheckCircle, XCircle, ArrowLeft, Settings, Plus, Pencil, ChevronRight, AlertCircle, CreditCard } from 'lucide-react';
import {
  getMyClients,
  getPendingRequests,
  getMyRoutines,
  getMyCoachProfile,
  getMyPlans,
  acceptRequest,
  rejectRequest,
  type ClientRelationship,
  type CoachRoutine,
  type CoachProfile,
  type CoachPlan,
} from '../../services/coachDashboard';
import { fmtPlanPrice } from '../../utils/plans';

export const CoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRelationship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClientRelationship[]>([]);
  const [routines, setRoutines] = useState<CoachRoutine[]>([]);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [c, p, r, prof, pl] = await Promise.all([
        getMyClients(),
        getPendingRequests(),
        getMyRoutines(),
        getMyCoachProfile().catch(() => null),
        getMyPlans().catch(() => []),
      ]);
      setClients(c ?? []);
      setPendingRequests(p ?? []);
      setRoutines(r ?? []);
      setProfile(prof);
      setPlans(pl ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const profileIncomplete = profile !== null && (!profile.bio?.trim() || !profile.specialization?.trim());

  useEffect(() => { load(); }, []);

  const handleAccept = async (id: string) => {
    await acceptRequest(id);
    load();
  };

  const handleReject = async (id: string) => {
    await rejectRequest(id);
    load();
  };

  const fullName = (rel: ClientRelationship) => {
    const u = rel.users;
    if (!u) return rel.user_id;
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Dumbbell className="w-8 h-8 text-lime-400 animate-bounce" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-(--color-accent-400) shrink-0" />
        <h1 className="text-xl md:text-3xl font-bold flex-1 min-w-0 truncate">Panel de Entrenador</h1>
        <button
          onClick={() => navigate('/coach/edit-profile')}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
          title="Editar perfil"
        >
          <Settings size={20} />
        </button>
      </div>

      {profileIncomplete && (
        <button
          onClick={() => navigate('/coach/edit-profile')}
          className="w-full mb-6 flex items-center gap-3 bg-amber-400/10 border border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/15 rounded-xl p-4 text-left transition-all group"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">Completa tu perfil para aparecer en el directorio</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {!profile?.bio?.trim() && !profile?.specialization?.trim()
                ? 'Falta tu bio y especialización'
                : !profile?.bio?.trim()
                ? 'Falta tu bio'
                : 'Falta tu especialización'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors shrink-0" />
        </button>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/coach/clients')}
          className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 hover:border-(--color-accent-400)/40 transition-colors w-full text-left sm:text-center"
        >
          <Users className="w-6 h-6 text-(--color-accent-400) shrink-0 sm:mx-auto sm:mb-2" />
          <div className="flex sm:flex-col items-baseline gap-2 sm:gap-0">
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-stone-400 text-sm">Clientes activos</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/coach/requests')}
          className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 hover:border-yellow-400/40 transition-colors w-full text-left sm:text-center"
        >
          <Clock className="w-6 h-6 text-yellow-400 shrink-0 sm:mx-auto sm:mb-2" />
          <div className="flex sm:flex-col items-baseline gap-2 sm:gap-0">
            <p className="text-2xl font-bold">{pendingRequests.length}</p>
            <p className="text-stone-400 text-sm">Solicitudes pendientes</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/coach/routines')}
          className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 hover:border-(--color-accent-400)/40 transition-colors w-full text-left sm:text-center"
        >
          <Dumbbell className="w-6 h-6 text-(--color-accent-400) shrink-0 sm:mx-auto sm:mb-2" />
          <div className="flex sm:flex-col items-baseline gap-2 sm:gap-0">
            <p className="text-2xl font-bold">{routines.length}</p>
            <p className="text-stone-400 text-sm">Mis rutinas</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/coach/plans')}
          className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 hover:border-(--color-accent-400)/40 transition-colors w-full text-left sm:text-center"
        >
          <CreditCard className="w-6 h-6 text-(--color-accent-400) shrink-0 sm:mx-auto sm:mb-2" />
          <div className="flex sm:flex-col items-baseline gap-2 sm:gap-0">
            <p className="text-2xl font-bold">{plans.length}</p>
            <p className="text-stone-400 text-sm">Mis planes</p>
          </div>
        </button>
      </div>

      {/* Mis rutinas — vista previa */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-stone-200">Mis rutinas</h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/coach/routines/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-stone-950 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              <Plus size={15} />
              Nueva
            </button>
            {routines.length > 0 && (
              <button
                onClick={() => navigate('/coach/routines')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-lime-400 hover:bg-white/5 transition-colors"
              >
                Ver todas
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {routines.length === 0 ? (
          <button
            onClick={() => navigate('/coach/routines/new')}
            className="w-full bg-stone-900 border border-dashed border-stone-700 rounded-xl p-8 text-center text-stone-400 hover:border-(--color-accent-400)/40 hover:text-stone-300 transition-all"
          >
            <Dumbbell className="w-7 h-7 mx-auto mb-2 text-stone-600" />
            <p className="font-medium">Aún no tienes rutinas</p>
            <p className="text-sm text-stone-500 mt-1">Crea tu primera plantilla para asignarla a tus clientes.</p>
          </button>
        ) : (
          <div className="space-y-3">
            {routines.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/coach/routines/${r.id}/edit`)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-(--color-accent-400)/40 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-(--color-accent-400)/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-(--color-accent-400)" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.name}</p>
                    <p className="text-stone-500 text-sm">
                      {r.total_days ? `${r.total_days} días` : '—'}
                      {r.is_cyclic && ' · Cíclica'}
                    </p>
                  </div>
                </div>
                <Pencil className="w-4 h-4 text-stone-500 group-hover:text-lime-400 transition-colors shrink-0" />
              </button>
            ))}
            {routines.length > 3 && (
              <button
                onClick={() => navigate('/coach/routines')}
                className="w-full text-center text-sm text-stone-400 hover:text-lime-400 py-2 transition-colors"
              >
                Ver las {routines.length} rutinas →
              </button>
            )}
          </div>
        )}
      </section>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-stone-200">Solicitudes pendientes</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{fullName(req)}</p>
                  <p className="text-stone-400 text-sm truncate">{req.users?.email}</p>
                  {req.plan && (
                    <p className="text-xs text-lime-400 font-semibold mt-0.5 truncate">
                      {req.plan.name} · {fmtPlanPrice(req.plan.price, req.plan.currency)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black font-medium text-sm hover:bg-lime-300 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/40 text-red-400 font-medium text-sm hover:bg-red-400/10 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active clients */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-stone-200">Clientes activos</h2>
        {clients.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center text-stone-400">
            No tienes clientes activos todavía.
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{fullName(client)}</p>
                  <p className="text-stone-400 text-sm">{client.users?.email}</p>
                </div>
                <button
                  onClick={() => navigate(`/coach/clients/${client.users?.id ?? client.user_id}`)}
                  className="px-3 py-1.5 rounded-lg border border-lime-400 text-lime-400 text-sm font-medium hover:bg-lime-400 hover:text-black transition-colors"
                >
                  Ver cliente →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
