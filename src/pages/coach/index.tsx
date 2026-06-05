import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  getMyClients,
  getPendingRequests,
  getMyRoutines,
  acceptRequest,
  rejectRequest,
  type ClientRelationship,
  type CoachRoutine,
} from '../../services/coachDashboard';

export const CoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRelationship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClientRelationship[]>([]);
  const [routines, setRoutines] = useState<CoachRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [c, p, r] = await Promise.all([
        getMyClients(),
        getPendingRequests(),
        getMyRoutines(),
      ]);
      setClients(c ?? []);
      setPendingRequests(p ?? []);
      setRoutines(r ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-stone-950 text-white p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Dumbbell className="w-8 h-8 text-lime-400" />
        <h1 className="text-3xl font-bold">Panel de Entrenador</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-lime-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{clients.length}</p>
          <p className="text-stone-400 text-sm">Clientes activos</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{pendingRequests.length}</p>
          <p className="text-stone-400 text-sm">Solicitudes pendientes</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <Dumbbell className="w-6 h-6 text-lime-400 mx-auto mb-2" />
          <p className="text-2xl font-bold">{routines.length}</p>
          <p className="text-stone-400 text-sm">Mis rutinas</p>
        </div>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-stone-200">Solicitudes pendientes</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{fullName(req)}</p>
                  <p className="text-stone-400 text-sm">{req.users?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-black font-medium text-sm hover:bg-lime-300 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 font-medium text-sm hover:text-red-300 transition-colors"
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
