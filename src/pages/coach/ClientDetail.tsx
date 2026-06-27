import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Star, MessageSquare, Dumbbell, Pencil, Trash2,
  Loader2, X, Check, Send, UserMinus, Calendar, TrendingUp,
  Lock, Plus, Clock, Activity, DollarSign,
} from 'lucide-react';
import {
  getClientDetail, addComment, getClientComments, updateComment,
  deleteComment, disconnectClient, getMyRoutines, assignRoutine,
  getClientPayments, createPayment, updatePayment, deletePayment,
  getClientActiveRoutine,
  type CoachComment, type CoachRoutine, type CoachPayment, type PaymentStatus,
} from '../../services/coachDashboard';
import { useAuth } from '../../contexts/useAuth';

const COMMENT_TYPES = ['general', 'nutrition', 'training', 'progress', 'motivation', 'technique'] as const;
type CommentType = typeof COMMENT_TYPES[number];
type Tab = 'actividad' | 'notas' | 'rutina' | 'pagos';

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; cls: string }> = {
  pending:   { label: 'Por confirmar', cls: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' },
  confirmed: { label: 'Confirmado', cls: 'bg-lime-400/10 text-lime-400 border border-lime-400/30' },
  cancelled: { label: 'Cancelado',  cls: 'bg-red-400/10 text-red-400 border border-red-400/30' },
};

const fmtMoney = (amount: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

const TYPE_LABELS: Record<CommentType, string> = {
  general: 'General', nutrition: 'Nutrición', training: 'Entrenamiento',
  progress: 'Progreso', motivation: 'Motivación', technique: 'Técnica',
};

const TYPE_COLORS: Record<CommentType, { bg: string; text: string }> = {
  general:    { bg: 'bg-stone-700',    text: 'text-stone-200' },
  nutrition:  { bg: 'bg-emerald-900',  text: 'text-emerald-300' },
  training:   { bg: 'bg-indigo-900',   text: 'text-indigo-300' },
  progress:   { bg: 'bg-lime-900',     text: 'text-lime-300' },
  motivation: { bg: 'bg-yellow-900',   text: 'text-yellow-300' },
  technique:  { bg: 'bg-blue-900',     text: 'text-blue-300' },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={11} className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-700'} />
    ))}
  </div>
);

export const ClientDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const isSelf = !!userId && userId === authUser?.id;

  const [clientData, setClientData] = useState<any>(null);
  const [comments, setComments] = useState<CoachComment[]>([]);
  const [routines, setRoutines] = useState<CoachRoutine[]>([]);
  const [assignedRoutine, setAssignedRoutine] = useState<CoachRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('actividad');

  // Comment form
  const [showAddForm, setShowAddForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<CommentType>('general');
  const [editPrivate, setEditPrivate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Routine
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [startMode, setStartMode] = useState<'monday' | 'today'>('monday');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Disconnect modal
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Payments
  const [payments, setPayments] = useState<CoachPayment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payConcept, setPayConcept] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payStatus, setPayStatus] = useState<PaymentStatus>('confirmed');
  const [payNotes, setPayNotes] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentActingId, setPaymentActingId] = useState<string | null>(null);
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getClientDetail(userId),
      getClientComments(userId),
      getMyRoutines(),
      getClientPayments(userId).catch(() => []),
      getClientActiveRoutine(userId).catch(() => null),
    ])
      .then(([detail, c, r, p, activeRoutine]) => {
        setClientData(detail);
        setComments(c ?? []);
        setRoutines(r ?? []);
        setPayments(p ?? []);
        setAssignedRoutine(activeRoutine ?? null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !payAmount || Number(payAmount) <= 0) return;
    setSavingPayment(true);
    try {
      const created = await createPayment(userId, {
        amount: Number(payAmount),
        status: payStatus,
        concept: payConcept.trim() || undefined,
        payment_date: payDate,
        notes: payNotes.trim() || undefined,
      });
      setPayments(prev => [created, ...prev]);
      setPayAmount('');
      setPayConcept('');
      setPayNotes('');
      setPayStatus('confirmed');
      setShowPaymentForm(false);
    } catch {} finally { setSavingPayment(false); }
  };

  const handlePaymentStatus = async (id: string, status: PaymentStatus) => {
    setPaymentActingId(id);
    try {
      const updated = await updatePayment(id, { status });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch {} finally { setPaymentActingId(null); }
  };

  const handleDeletePayment = async (id: string) => {
    setPaymentActingId(id);
    try {
      await deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      setConfirmDeletePaymentId(null);
    } catch {} finally { setPaymentActingId(null); }
  };

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
      setShowAddForm(false);
    } finally { setSubmitting(false); }
  };

  const startEdit = (c: CoachComment) => {
    setEditingId(c.id);
    setEditText(c.comment);
    setEditType((c.comment_type as CommentType) ?? 'general');
    setEditPrivate(c.is_private);
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async () => {
    if (!userId || !editingId || !editText.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateComment(userId, editingId, { comment: editText, comment_type: editType, is_private: editPrivate });
      setComments(prev => prev.map(c => c.id === editingId ? updated : c));
      setEditingId(null);
    } finally { setSavingEdit(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId) return;
    setDeletingId(commentId);
    try {
      await deleteComment(userId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setConfirmDeleteId(null);
    } finally { setDeletingId(null); }
  };

  const handleDisconnect = async () => {
    if (!userId) return;
    setDisconnecting(true);
    try {
      await disconnectClient(userId);
      navigate('/coach', { state: { notice: `Terminaste la vinculación con ${displayName}. Sus pagos y notas quedan guardados.` } });
    } catch {} finally { setDisconnecting(false); }
  };

  const handleAssignRoutine = async () => {
    if (!userId || !selectedRoutineId) return;
    const alreadyHasRoutine = assignedRoutine?.id ?? clientData?.assigned_routine?.id ?? clientData?.routine_id;
    if (alreadyHasRoutine && !showResetWarning) { setShowResetWarning(true); return; }
    setShowResetWarning(false);
    setAssigning(true);
    setAssignMsg(null);
    try {
      await assignRoutine(userId, selectedRoutineId, startMode);
      const selected = routines.find(r => r.id === selectedRoutineId);
      if (selected) setAssignedRoutine(selected);
      setAssignMsg({ type: 'success', text: 'Rutina asignada exitosamente' });
    } catch (e: any) {
      setAssignMsg({ type: 'error', text: e?.message ?? 'Error al asignar rutina' });
    } finally { setAssigning(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Dumbbell className="w-8 h-8 text-(--color-accent-400) animate-bounce" />
    </div>
  );

  const user = clientData?.user;
  const workouts = clientData?.recentWorkouts ?? [];
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || userId;
  const avgRating = workouts.filter((w: any) => w.rating != null).length
    ? (workouts.reduce((a: number, w: any) => a + (w.rating ?? 0), 0) / workouts.filter((w: any) => w.rating != null).length).toFixed(1)
    : null;
  const lastWorkout = workouts.find((w: any) => w.completed_at);
  const currentRoutineName =
    assignedRoutine?.name ??
    clientData?.assigned_routine?.name ??
    routines.find(r => r.id === clientData?.routine_id)?.name;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'actividad', label: 'Actividad',  icon: <Activity size={15} />,    count: workouts.length },
    { id: 'notas',     label: 'Notas',      icon: <MessageSquare size={15} />, count: comments.length },
    { id: 'rutina',    label: 'Rutina',     icon: <Dumbbell size={15} /> },
    { id: 'pagos',     label: 'Pagos',      icon: <DollarSign size={15} />,  count: payments.length },
  ];

  const confirmedTotal = payments
    .filter(p => p.status === 'confirmed')
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingTotal = payments
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-stone-950 text-white">

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-20 shrink-0"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shrink-0"
            style={user?.avatar_url ? undefined : { background: 'color-mix(in srgb, var(--color-accent-400) 20%, transparent)', color: 'var(--color-accent-400)' }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              : displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate leading-tight">{isSelf ? 'Tú (vista de cliente)' : displayName}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
          {userId && !isSelf && (
            <button
              onClick={() => navigate(`/messages/${userId}`, { state: { partnerName: displayName, partnerAvatar: user?.avatar_url ?? null } })}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,var(--color-accent-400),var(--color-accent-500))' }}
            >
              <Send size={13} />
              <span className="hidden sm:inline">Mensaje</span>
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400">
            <TrendingUp size={12} className="text-(--color-accent-400)" />
            <span><strong className="text-white">{workouts.length}</strong> entrenos</span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1.5 text-stone-400">
              <Star size={12} className="text-yellow-400" />
              <span><strong className="text-white">{avgRating}</strong> promedio</span>
            </div>
          )}
          {lastWorkout && (
            <div className="flex items-center gap-1.5 text-stone-400">
              <Clock size={12} />
              <span>Último: <strong className="text-white">{fmtDate(lastWorkout.completed_at)}</strong></span>
            </div>
          )}
          {currentRoutineName && (
            <div className="flex items-center gap-1.5 text-stone-400 ml-auto">
              <Dumbbell size={12} className="text-(--color-accent-400)" />
              <span className="truncate max-w-[120px]">{currentRoutineName}</span>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="max-w-2xl mx-auto flex gap-1 overflow-x-auto scrollbar-none" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'text-(--color-accent-400) border-(--color-accent-400)'
                  : 'text-stone-400 border-transparent hover:text-stone-200'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-(--color-accent-400)/20 text-(--color-accent-400)' : 'bg-stone-800 text-stone-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── ACTIVIDAD ── */}
        {activeTab === 'actividad' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Entrenamientos recientes</p>
            {workouts.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
                <Activity size={28} className="text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Sin entrenamientos registrados todavía.</p>
              </div>
            ) : workouts.map((w: any) => (
              <div key={w.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-xl shrink-0 mt-0.5">
                  <Calendar size={15} className="text-(--color-accent-400)" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{fmtDate(w.completed_at)}</p>
                    {w.rating != null && <StarRow rating={w.rating} />}
                  </div>
                  {w.duration_minutes && (
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {w.duration_minutes} min
                    </p>
                  )}
                  {w.notes && <p className="text-sm text-stone-400 mt-1.5 leading-relaxed">{w.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTAS ── */}
        {activeTab === 'notas' && (
          <div>
            {/* Add note button / form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-stone-700 text-stone-400 hover:border-(--color-accent-400)/50 hover:text-(--color-accent-400) transition-all mb-5 text-sm font-medium"
              >
                <Plus size={16} />
                Agregar nota
              </button>
            ) : (
              <form onSubmit={handleAddComment} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-200">Nueva nota</p>
                  <button type="button" onClick={() => setShowAddForm(false)} className="p-1 text-stone-500 hover:text-white transition-colors">
                    <X size={15} />
                  </button>
                </div>

                {/* Type pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {COMMENT_TYPES.map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setCommentType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        commentType === t
                          ? `${TYPE_COLORS[t].bg} ${TYPE_COLORS[t].text} ring-1 ring-white/20`
                          : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escribe tu nota..."
                  rows={3}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-(--color-accent-400) resize-none transition-colors"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer select-none">
                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="accent-(--color-accent-400)" />
                    <Lock size={12} />
                    Solo visible para mí
                  </label>
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="px-4 py-1.5 text-sm font-bold text-stone-950 rounded-xl disabled:opacity-50 transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg,var(--color-accent-400),var(--color-accent-500))' }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* Notes list */}
            {comments.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
                <MessageSquare size={28} className="text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Sin notas todavía.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{comments.length} nota{comments.length !== 1 ? 's' : ''}</p>
                {comments.map(c => {
                  const colors = TYPE_COLORS[c.comment_type as CommentType] ?? TYPE_COLORS.general;
                  return (
                    <div key={c.id} className={`rounded-2xl border p-4 ${c.is_private ? 'bg-stone-900/50 border-stone-700/50' : 'bg-stone-900 border-stone-800'}`}>
                      {editingId === c.id ? (
                        <div className="space-y-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {COMMENT_TYPES.map(t => (
                              <button key={t} type="button" onClick={() => setEditType(t)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  editType === t
                                    ? `${TYPE_COLORS[t].bg} ${TYPE_COLORS[t].text} ring-1 ring-white/20`
                                    : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                                }`}
                              >{TYPE_LABELS[t]}</button>
                            ))}
                          </div>
                          <textarea
                            value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                            className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-(--color-accent-400) resize-none transition-colors"
                          />
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer select-none">
                              <input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} className="accent-(--color-accent-400)" />
                              <Lock size={12} /> Privado
                            </label>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingId(null)} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 transition-colors">
                                <X size={13} />
                              </button>
                              <button onClick={handleSaveEdit} disabled={savingEdit || !editText.trim()}
                                className="p-2 rounded-xl bg-(--color-accent-400) text-stone-950 hover:brightness-110 disabled:opacity-50 transition-all">
                                {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                              {TYPE_LABELS[c.comment_type as CommentType] ?? c.comment_type}
                            </span>
                            {c.is_private && (
                              <span className="flex items-center gap-1 text-xs text-stone-500">
                                <Lock size={10} /> Privado
                              </span>
                            )}
                            <span className="text-xs text-stone-600 ml-auto">{fmtDate(c.created_at)}</span>
                            <button onClick={() => startEdit(c)} className="p-1 rounded-lg text-stone-600 hover:text-(--color-accent-400) transition-colors" title="Editar">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(c.id)} className="p-1 rounded-lg text-stone-600 hover:text-red-400 transition-colors" title="Borrar">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-sm text-stone-200 leading-relaxed">{c.comment}</p>
                          {confirmDeleteId === c.id && (
                            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-stone-700/50">
                              <span className="text-xs text-stone-400 flex-1">¿Eliminar esta nota?</span>
                              <button onClick={() => handleDeleteComment(c.id)} disabled={deletingId === c.id}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 disabled:opacity-50 transition-colors">
                                {deletingId === c.id ? <Loader2 size={11} className="animate-spin" /> : 'Eliminar'}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1 bg-stone-700 text-stone-300 rounded-lg text-xs hover:bg-stone-600 transition-colors">
                                Cancelar
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RUTINA ── */}
        {activeTab === 'rutina' && (
          <div className="space-y-6">
            {/* Rutina actual */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Rutina asignada</p>
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${currentRoutineName ? 'bg-stone-900 border-stone-800' : 'bg-stone-900/50 border-stone-800/50'}`}>
                <div className={`p-2.5 rounded-xl ${currentRoutineName ? 'bg-(--color-accent-400)/15' : 'bg-stone-800'}`}>
                  <Dumbbell size={18} className={currentRoutineName ? 'text-(--color-accent-400)' : 'text-stone-600'} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{currentRoutineName ?? 'Sin rutina asignada'}</p>
                  <p className="text-xs text-stone-500">{currentRoutineName ? 'Rutina activa' : 'Asigna una rutina para que empiece a entrenar'}</p>
                </div>
              </div>
            </div>

            {/* Asignar */}
            {routines.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">{currentRoutineName ? 'Cambiar rutina' : 'Asignar rutina'}</p>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4">
                  <select
                    value={selectedRoutineId}
                    onChange={e => { setSelectedRoutineId(e.target.value); setShowResetWarning(false); }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-(--color-accent-400) transition-colors"
                  >
                    <option value="">Selecciona una rutina...</option>
                    {routines.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}{r.total_days ? ` · ${r.total_days} días` : ''}{r.is_cyclic ? ' · cíclica' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Start mode */}
                  <div>
                    <p className="text-xs text-stone-500 mb-2">Inicio de la rutina</p>
                    <div className="flex gap-2">
                      {(['monday', 'today'] as const).map(mode => (
                        <button
                          key={mode} type="button"
                          onClick={() => setStartMode(mode)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                            startMode === mode
                              ? 'bg-(--color-accent-400)/15 text-(--color-accent-400) border border-(--color-accent-400)/30'
                              : 'bg-stone-800 text-stone-400 border border-transparent hover:bg-stone-700'
                          }`}
                        >
                          {mode === 'monday' ? 'Desde el lunes' : 'Desde hoy'}
                        </button>
                      ))}
                    </div>
                    {startMode === 'monday' && <p className="text-xs text-stone-600 mt-1.5">Recomendado para mantener el ciclo semanal alineado</p>}
                  </div>

                  {/* Reset warning */}
                  {showResetWarning && (
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 space-y-2">
                      <p className="text-sm text-yellow-300">⚠️ El cliente ya tiene una rutina activa. Reasignar <strong>reiniciará su ciclo</strong> (el historial se conserva).</p>
                      <div className="flex gap-2">
                        <button onClick={handleAssignRoutine} disabled={assigning} className="px-3 py-1.5 bg-yellow-400 text-stone-950 font-bold rounded-lg text-xs hover:bg-yellow-300 disabled:opacity-50 transition-colors">
                          {assigning ? <Loader2 size={12} className="animate-spin" /> : 'Confirmar cambio'}
                        </button>
                        <button onClick={() => setShowResetWarning(false)} className="px-3 py-1.5 bg-stone-700 text-stone-300 rounded-lg text-xs hover:bg-stone-600 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {assignMsg && (
                    <p className={`text-sm flex items-center gap-1.5 ${assignMsg.type === 'success' ? 'text-(--color-accent-400)' : 'text-red-400'}`}>
                      {assignMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
                      {assignMsg.text}
                    </p>
                  )}

                  {!showResetWarning && (
                    <button
                      onClick={handleAssignRoutine}
                      disabled={assigning || !selectedRoutineId}
                      className="w-full py-2.5 font-bold text-sm text-stone-950 rounded-xl disabled:opacity-40 transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg,var(--color-accent-400),var(--color-accent-500))' }}
                    >
                      {assigning ? 'Asignando...' : currentRoutineName ? 'Cambiar rutina' : 'Asignar rutina'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Danger zone */}
            {!isSelf && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-3">Zona de peligro</p>
                <div className="bg-stone-900 border border-red-900/40 rounded-2xl p-4">
                  <button
                    onClick={() => setConfirmDisconnect(true)}
                    className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    <UserMinus size={15} />
                    Terminar conexión con este cliente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAGOS ── */}
        {activeTab === 'pagos' && (
          <div className="space-y-5">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                <p className="text-xs text-stone-500 mb-1">Confirmado</p>
                <p className="text-xl font-bold text-lime-400 tabular-nums">{fmtMoney(confirmedTotal)}</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                <p className="text-xs text-stone-500 mb-1">Por confirmar</p>
                <p className="text-xl font-bold text-yellow-400 tabular-nums">{fmtMoney(pendingTotal)}</p>
              </div>
            </div>

            {/* Registrar pago */}
            {!showPaymentForm ? (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-stone-700 text-stone-400 hover:border-(--color-accent-400)/50 hover:text-(--color-accent-400) transition-all text-sm font-medium"
              >
                <Plus size={16} />
                Registrar pago
              </button>
            ) : (
              <form onSubmit={handleAddPayment} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-200">Nuevo pago</p>
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="p-1 text-stone-500 hover:text-white transition-colors">
                    <X size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Monto (MXN) *</p>
                    <input
                      type="number" min="1" step="0.01" required
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      placeholder="500"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--color-accent-400) transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Fecha</p>
                    <input
                      type="date"
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-(--color-accent-400) transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-stone-500 mb-1">Concepto</p>
                  <input
                    value={payConcept}
                    onChange={e => setPayConcept(e.target.value)}
                    placeholder="Ej. Mensualidad junio"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-(--color-accent-400) transition-colors"
                  />
                </div>

                <div>
                  <p className="text-xs text-stone-500 mb-2">Estado</p>
                  <div className="flex gap-2">
                    {(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map(s => (
                      <button
                        key={s} type="button"
                        onClick={() => setPayStatus(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          payStatus === s ? PAYMENT_STATUS_META[s].cls : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                        }`}
                      >
                        {PAYMENT_STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="Notas (opcional)"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-(--color-accent-400) transition-colors"
                />

                <button
                  type="submit"
                  disabled={savingPayment || !payAmount || Number(payAmount) <= 0}
                  className="w-full py-2.5 font-bold text-sm text-stone-950 rounded-xl disabled:opacity-40 transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg,var(--color-accent-400),var(--color-accent-500))' }}
                >
                  {savingPayment ? 'Guardando...' : 'Registrar pago'}
                </button>
              </form>
            )}

            {/* Historial */}
            {payments.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
                <DollarSign size={28} className="text-stone-700 mx-auto mb-3" />
                <p className="text-stone-400 text-sm">Sin pagos registrados todavía.</p>
                <p className="text-stone-600 text-xs mt-1">Aquí solo se lleva el registro; los cobros se hacen fuera de la app.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                  {payments.length} pago{payments.length !== 1 ? 's' : ''}
                </p>
                {payments.map(p => (
                  <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white tabular-nums">{fmtMoney(Number(p.amount), p.currency)}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${PAYMENT_STATUS_META[p.status]?.cls ?? ''}`}>
                        {PAYMENT_STATUS_META[p.status]?.label ?? p.status}
                      </span>
                      <span className="text-xs text-stone-600 ml-auto">{fmtDate(p.payment_date)}</span>
                      <button
                        onClick={() => setConfirmDeletePaymentId(p.id)}
                        className="p-1 rounded-lg text-stone-600 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {p.concept && <p className="text-sm text-stone-300 mt-1.5">{p.concept}</p>}
                    {p.notes && <p className="text-xs text-stone-500 mt-1">{p.notes}</p>}

                    {p.status === 'pending' && (
                      <div className="mt-3 flex gap-2 pt-3 border-t border-stone-800">
                        <button
                          onClick={() => handlePaymentStatus(p.id, 'confirmed')}
                          disabled={paymentActingId === p.id}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-lime-400 text-stone-950 text-xs font-bold hover:bg-lime-300 disabled:opacity-50 transition-colors"
                        >
                          <Check size={12} /> Confirmar
                        </button>
                        <button
                          onClick={() => handlePaymentStatus(p.id, 'cancelled')}
                          disabled={paymentActingId === p.id}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-400/40 text-red-400 text-xs font-medium hover:bg-red-400/10 disabled:opacity-50 transition-colors"
                        >
                          <X size={12} /> Cancelar
                        </button>
                      </div>
                    )}

                    {confirmDeletePaymentId === p.id && (
                      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-stone-800">
                        <span className="text-xs text-stone-400 flex-1">¿Eliminar este registro de pago?</span>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          disabled={paymentActingId === p.id}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                          {paymentActingId === p.id ? <Loader2 size={11} className="animate-spin" /> : 'Eliminar'}
                        </button>
                        <button onClick={() => setConfirmDeletePaymentId(null)} className="px-3 py-1 bg-stone-700 text-stone-300 rounded-lg text-xs hover:bg-stone-600 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Disconnect modal ── */}
      {confirmDisconnect && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => !disconnecting && setConfirmDisconnect(false)}>
            <div onClick={e => e.stopPropagation()}
              className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/15">
                  <UserMinus size={20} className="text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white">¿Terminar conexión?</h3>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Esto finalizará la relación con este cliente y{' '}
                <strong className="text-stone-200">perderá la rutina asignada</strong>.
                Sus pagos, notas e historial de entrenamientos se conservan,
                y podrá volver a solicitarte cuando quiera.
              </p>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setConfirmDisconnect(false)} disabled={disconnecting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {disconnecting ? <Loader2 size={15} className="animate-spin" /> : <><UserMinus size={15} /> Terminar</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
