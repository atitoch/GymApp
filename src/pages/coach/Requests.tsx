import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2, CheckCircle, XCircle, CreditCard, DollarSign, X } from 'lucide-react';
import { getPendingRequests, acceptRequest, rejectRequest, type ClientRelationship } from '../../services/coachDashboard';
import { PLAN_INTERVAL_SUFFIX, fmtPlanPrice } from '../../utils/plans';

export const CoachRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ClientRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  // Solicitud con plan: al aceptar se pregunta si el pago ya se recibió
  const [confirmAcceptId, setConfirmAcceptId] = useState<string | null>(null);
  // Confirma a dónde fue la solicitud después de aceptar/rechazar
  const [lastAction, setLastAction] = useState<{ type: 'accepted' | 'rejected'; name: string; userId?: string } | null>(null);

  const load = () =>
    getPendingRequests().then(setRequests).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const doAccept = async (id: string, paymentReceived?: boolean) => {
    const req = requests.find((r) => r.id === id);
    setActingId(id);
    try {
      await acceptRequest(id, paymentReceived != null ? { payment_received: paymentReceived } : undefined);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setConfirmAcceptId(null);
      if (req) setLastAction({ type: 'accepted', name: fullName(req), userId: req.users?.id ?? req.user_id });
    } catch {} finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const req = requests.find((r) => r.id === id);
    setActingId(id);
    try {
      await rejectRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (req) setLastAction({ type: 'rejected', name: fullName(req) });
    } catch {} finally {
      setActingId(null);
    }
  };

  const handleAcceptClick = (req: ClientRelationship) => {
    // Sin plan elegido: aceptar directo, como siempre
    if (!req.plan) return doAccept(req.id);
    setConfirmAcceptId(confirmAcceptId === req.id ? null : req.id);
  };

  const fullName = (rel: ClientRelationship) => {
    const u = rel.users;
    if (!u) return rel.user_id;
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <Clock size={20} className="text-yellow-400" />
          <h1 className="text-lg font-black">Solicitudes pendientes</h1>
          {!loading && (
            <span className="ml-auto text-sm font-bold text-stone-500">{requests.length}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {lastAction && (
          <div className={`flex items-center gap-3 rounded-xl p-4 border ${
            lastAction.type === 'accepted'
              ? 'bg-lime-400/10 border-lime-400/30'
              : 'bg-stone-900 border-stone-800'
          }`}>
            {lastAction.type === 'accepted'
              ? <CheckCircle className="w-5 h-5 text-lime-400 shrink-0" />
              : <XCircle className="w-5 h-5 text-stone-500 shrink-0" />}
            <p className={`flex-1 text-sm ${lastAction.type === 'accepted' ? 'text-lime-300' : 'text-stone-400'}`}>
              {lastAction.type === 'accepted'
                ? <>{lastAction.name} ya aparece en tus clientes activos.</>
                : <>Rechazaste la solicitud de {lastAction.name}.</>}
            </p>
            {lastAction.type === 'accepted' && lastAction.userId && (
              <button
                onClick={() => navigate(`/coach/clients/${lastAction.userId}`)}
                className="text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors shrink-0"
              >
                Ver cliente →
              </button>
            )}
            <button onClick={() => setLastAction(null)} className="p-1 rounded-lg text-stone-500 hover:text-stone-300 transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
            <Clock size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="font-bold text-white">Sin solicitudes pendientes</p>
            <p className="text-sm mt-1">Las solicitudes de conexión de nuevos clientes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{fullName(req)}</p>
                    <p className="text-stone-400 text-sm truncate">{req.users?.email}</p>
                    {req.plan && (
                      <>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30">
                          <CreditCard size={12} className="text-lime-400" />
                          <span className="text-xs font-bold text-lime-400">
                            {req.plan.name} · {fmtPlanPrice(req.plan.price, req.plan.currency)}
                            {req.plan.interval ? PLAN_INTERVAL_SUFFIX[req.plan.interval] : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">Al aceptar podrás registrar el pago de este plan.</p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptClick(req)}
                      disabled={actingId === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black font-medium text-sm hover:bg-lime-300 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actingId === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/40 text-red-400 font-medium text-sm hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {confirmAcceptId === req.id && req.plan && (
                  <div className="mt-3 border-t border-stone-800 pt-3 space-y-2.5">
                    <p className="text-sm text-stone-300">
                      Al aceptar se crea el registro del pago de <strong className="text-white">{fmtPlanPrice(req.plan.price, req.plan.currency)}</strong> ({req.plan.name}) en la pestaña Pagos del cliente.
                    </p>
                    <p className="text-sm font-semibold text-white">¿Ya recibiste ese pago?</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => doAccept(req.id, true)}
                        disabled={actingId === req.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-lime-400 text-black font-bold text-xs hover:bg-lime-300 transition-colors disabled:opacity-50"
                      >
                        {actingId === req.id ? <Loader2 size={13} className="animate-spin" /> : <DollarSign size={13} />}
                        Sí, ya lo recibí
                      </button>
                      <button
                        onClick={() => doAccept(req.id, false)}
                        disabled={actingId === req.id}
                        className="flex-1 px-3 py-2 rounded-lg border border-stone-700 text-stone-300 font-medium text-xs hover:bg-stone-800 transition-colors disabled:opacity-50"
                      >
                        Aún no — dejarlo por confirmar
                      </button>
                      <button
                        onClick={() => setConfirmAcceptId(null)}
                        className="px-3 py-2 rounded-lg text-stone-500 text-xs hover:text-stone-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
