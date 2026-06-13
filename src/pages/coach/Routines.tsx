import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Dumbbell, Pencil, Trash2, Loader2, UserPlus, Check } from 'lucide-react';
import { getMyRoutines, deleteRoutineTemplate, assignRoutine, type CoachRoutine } from '../../services/coachDashboard';
import { useAuth } from '../../contexts/useAuth';

export const CoachRoutines: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<CoachRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmSelfAssignId, setConfirmSelfAssignId] = useState<string | null>(null);
  const [selfAssigningId, setSelfAssigningId] = useState<string | null>(null);
  const [selfAssignedId, setSelfAssignedId] = useState<string | null>(null);

  useEffect(() => {
    getMyRoutines().then(setRoutines).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRoutineTemplate(id);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  // El coach también entrena: se asigna la plantilla a sí mismo como cualquier cliente
  const handleSelfAssign = async (id: string) => {
    if (!user?.id) return;
    setSelfAssigningId(id);
    try {
      await assignRoutine(user.id, id, 'monday');
      setSelfAssignedId(id);
      setConfirmSelfAssignId(null);
      setTimeout(() => setSelfAssignedId(null), 3000);
    } catch {} finally {
      setSelfAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <Dumbbell size={20} className="text-lime-400" />
            <h1 className="text-lg font-black">Mis rutinas</h1>
          </div>
          <button
            onClick={() => navigate('/coach/routines/new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            <Plus size={15} />
            Nueva rutina
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : routines.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-10 text-center space-y-4">
            <Dumbbell size={32} className="text-stone-600 mx-auto" />
            <p className="text-white font-bold">Sin rutinas todavía</p>
            <p className="text-sm text-stone-400">Crea tu primera plantilla de rutina para asignarla a tus clientes.</p>
            <button
              onClick={() => navigate('/coach/routines/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-950"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              <Plus size={15} /> Crear rutina
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((r) => (
              <div key={r.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{r.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {r.total_days ? `${r.total_days} días` : '—'}
                      {r.is_cyclic && ' · Cíclica'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => { setConfirmSelfAssignId(r.id); setConfirmDeleteId(null); }}
                      className="p-2 rounded-lg text-stone-400 hover:text-sky-400 hover:bg-stone-800 transition-all"
                      title="Asignármela a mí"
                    >
                      {selfAssignedId === r.id ? <Check size={15} className="text-lime-400" /> : <UserPlus size={15} />}
                    </button>
                    <button
                      onClick={() => navigate(`/coach/routines/${r.id}/edit`)}
                      className="p-2 rounded-lg text-stone-400 hover:text-lime-400 hover:bg-stone-800 transition-all"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteId(r.id); setConfirmSelfAssignId(null); }}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-all"
                      title="Borrar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {selfAssignedId === r.id && (
                  <p className="mt-2 text-xs text-lime-400">Rutina asignada a tu cuenta. La verás en tu dashboard a partir del lunes.</p>
                )}
                {confirmSelfAssignId === r.id && (
                  <div className="mt-3 flex items-center gap-2 text-sm border-t border-stone-800 pt-3">
                    <span className="text-stone-400 flex-1">¿Asignarte esta rutina? Reemplaza tu rutina actual.</span>
                    <button
                      onClick={() => handleSelfAssign(r.id)}
                      disabled={selfAssigningId === r.id}
                      className="px-3 py-1 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 disabled:opacity-50"
                    >
                      {selfAssigningId === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Asignármela'}
                    </button>
                    <button onClick={() => setConfirmSelfAssignId(null)} className="px-3 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700">
                      Cancelar
                    </button>
                  </div>
                )}
                {confirmDeleteId === r.id && (
                  <div className="mt-3 flex items-center gap-2 text-sm border-t border-stone-800 pt-3">
                    <span className="text-stone-400 flex-1">¿Borrar esta plantilla? Ya no podrás asignarla a más clientes.</span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="px-3 py-1 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-400 disabled:opacity-50"
                    >
                      {deletingId === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Borrar'}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700">
                      Cancelar
                    </button>
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
