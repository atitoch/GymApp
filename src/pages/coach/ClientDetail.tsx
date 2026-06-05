import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Dumbbell } from 'lucide-react';
import {
  getClientDetail,
  addComment,
  getClientComments,
  getMyRoutines,
  assignRoutine,
  type CoachComment,
  type CoachRoutine,
} from '../../services/coachDashboard';

const COMMENT_TYPES = ['general', 'progress', 'nutrition', 'motivation', 'technique'] as const;
type CommentType = typeof COMMENT_TYPES[number];

const TYPE_LABELS: Record<CommentType, string> = {
  general: 'General',
  progress: 'Progreso',
  nutrition: 'Nutrición',
  motivation: 'Motivación',
  technique: 'Técnica',
};

const TYPE_COLORS: Record<CommentType, string> = {
  general: 'bg-stone-700 text-stone-200',
  progress: 'bg-lime-900 text-lime-300',
  nutrition: 'bg-green-900 text-green-300',
  motivation: 'bg-yellow-900 text-yellow-300',
  technique: 'bg-blue-900 text-blue-300',
};

export const ClientDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState<any>(null);
  const [comments, setComments] = useState<CoachComment[]>([]);
  const [routines, setRoutines] = useState<CoachRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [startMode, setStartMode] = useState<'monday' | 'today'>('monday');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getClientDetail(userId),
      getClientComments(userId),
      getMyRoutines(),
    ]).then(([detail, c, r]) => {
      setClientData(detail);
      setComments(c ?? []);
      setRoutines(r ?? []);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const created = await addComment(userId, { comment: commentText, comment_type: commentType, is_private: isPrivate });
      setComments([created, ...comments]);
      setCommentText('');
      setIsPrivate(false);
      setCommentType('general');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignRoutine = async () => {
    if (!userId || !selectedRoutineId) return;
    const alreadyHasRoutine = (clientData as any)?.routine_id;
    if (alreadyHasRoutine && !showResetWarning) {
      setShowResetWarning(true);
      return;
    }
    setShowResetWarning(false);
    setAssigning(true);
    setAssignMsg(null);
    try {
      await assignRoutine(userId, selectedRoutineId, startMode);
      setAssignMsg({ type: 'success', text: 'Rutina asignada exitosamente' });
    } catch (e: any) {
      setAssignMsg({ type: 'error', text: e?.message ?? 'Error al asignar rutina' });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Dumbbell className="w-8 h-8 text-lime-400 animate-bounce" />
    </div>
  );

  const user = clientData?.user;
  const workouts = clientData?.recentWorkouts ?? [];
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || userId;

  return (
    <div className="min-h-screen bg-stone-950 text-white p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/coach')}
        className="flex items-center gap-2 text-stone-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{displayName}</h1>
        <p className="text-stone-400">{user?.email}</p>
      </div>

      {/* Recent workouts */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-lime-400" />
          Entrenamientos recientes
        </h2>
        {workouts.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin registros de entrenamientos.</p>
        ) : (
          <div className="space-y-2">
            {workouts.map((w: any) => (
              <div key={w.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm">{w.completed_at ? new Date(w.completed_at).toLocaleDateString('es-MX') : '—'}</p>
                  {w.notes && <p className="text-stone-400 text-xs mt-0.5">{w.notes}</p>}
                </div>
                {w.rating != null && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-sm">{w.rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Comments */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-lime-400" />
          Comentarios
        </h2>

        {/* Existing comments */}
        {comments.length > 0 && (
          <div className="space-y-2 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.comment_type as CommentType] ?? 'bg-stone-700 text-stone-200'}`}>
                    {TYPE_LABELS[c.comment_type as CommentType] ?? c.comment_type}
                  </span>
                  {c.is_private && <span className="text-xs text-stone-500">privado</span>}
                  <span className="text-stone-500 text-xs ml-auto">
                    {new Date(c.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <p className="text-sm text-stone-200">{c.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-stone-300">Agregar comentario</p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows={3}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-lime-400 resize-none"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as CommentType)}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lime-400"
            >
              {COMMENT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="accent-lime-400"
              />
              Privado
            </label>
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="ml-auto px-4 py-1.5 bg-lime-400 text-black font-medium text-sm rounded-lg hover:bg-lime-300 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </section>

      {/* Assign routine */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-lime-400" />
          Asignar rutina
        </h2>
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
          {routines.length === 0 ? (
            <p className="text-stone-400 text-sm">No tienes rutinas activas.</p>
          ) : (
            <>
              <select
                value={selectedRoutineId}
                onChange={(e) => { setSelectedRoutineId(e.target.value); setShowResetWarning(false); }}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                <option value="">Selecciona una rutina...</option>
                {routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.total_days ? ` (${r.total_days} días)` : ''}{r.is_cyclic ? ' · cíclica' : ''}
                  </option>
                ))}
              </select>

              {/* Inicio de la rutina */}
              <div className="flex gap-3 text-sm">
                {(['monday', 'today'] as const).map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-stone-300">
                    <input
                      type="radio"
                      name="start_mode"
                      value={mode}
                      checked={startMode === mode}
                      onChange={() => setStartMode(mode)}
                      className="accent-lime-400"
                    />
                    {mode === 'monday' ? 'Empezar el lunes (recomendado)' : 'Empezar hoy'}
                  </label>
                ))}
              </div>

              {/* Aviso de reset */}
              {showResetWarning && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 text-sm text-yellow-300 space-y-2">
                  <p>⚠️ Este cliente ya tiene una rutina asignada. Reasignar <strong>reiniciará su rutina</strong> (el historial de entrenamientos se conserva).</p>
                  <div className="flex gap-2">
                    <button onClick={handleAssignRoutine} disabled={assigning} className="px-3 py-1 bg-yellow-400 text-stone-950 font-bold rounded text-xs hover:bg-yellow-300 disabled:opacity-50">
                      Confirmar
                    </button>
                    <button onClick={() => setShowResetWarning(false)} className="px-3 py-1 bg-stone-700 text-stone-300 rounded text-xs hover:bg-stone-600">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {assignMsg && (
                <p className={`text-sm ${assignMsg.type === 'success' ? 'text-lime-400' : 'text-red-400'}`}>
                  {assignMsg.text}
                </p>
              )}
              {!showResetWarning && (
                <button
                  onClick={handleAssignRoutine}
                  disabled={assigning || !selectedRoutineId}
                  className="px-4 py-1.5 bg-lime-400 text-black font-medium text-sm rounded-lg hover:bg-lime-300 disabled:opacity-50 transition-colors"
                >
                  {assigning ? 'Asignando...' : 'Asignar rutina'}
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
