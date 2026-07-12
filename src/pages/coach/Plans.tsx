import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, X, Check,
  CreditCard, Eye, EyeOff,
} from 'lucide-react';
import {
  getMyPlans, createPlan, updatePlan, deletePlan,
  type CoachPlan, type PlanInterval,
} from '../../services/coachDashboard';
import { PLAN_INTERVAL_LABELS, PLAN_INTERVAL_SUFFIX, fmtPlanPrice } from '../../utils/plans';

const INTERVALS = Object.keys(PLAN_INTERVAL_LABELS) as PlanInterval[];

const emptyForm = { name: '', description: '', price: '', interval: 'monthly' as PlanInterval };

export const CoachPlans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form (crear o editar)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete / toggle
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    getMyPlans()
      .then(setPlans)
      .catch(() => setError('No se pudieron cargar los planes. El backend de planes podría no estar disponible todavía.'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (plan: CoachPlan) => {
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      interval: plan.interval,
    });
    setEditingId(plan.id);
    setShowForm(true);
    setConfirmDeleteId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price <= 0) return;
    setSaving(true);
    setError(null);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        currency: 'MXN',
        interval: form.interval,
      };
      if (editingId) {
        const updated = await updatePlan(editingId, data);
        setPlans(prev => prev.map(p => (p.id === editingId ? updated : p)));
      } else {
        const created = await createPlan(data);
        setPlans(prev => [created, ...prev]);
      }
      closeForm();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar el plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: CoachPlan) => {
    setTogglingId(plan.id);
    try {
      const updated = await updatePlan(plan.id, { is_active: !plan.is_active });
      setPlans(prev => prev.map(p => (p.id === plan.id ? updated : p)));
    } catch {} finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      setConfirmDeleteId(null);
    } catch {} finally {
      setDeletingId(null);
    }
  };

  const canSave = form.name.trim() && parseFloat(form.price) > 0;

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
              <ArrowLeft size={20} />
            </button>
            <CreditCard size={20} className="text-lime-400 shrink-0" />
            <h1 className="text-lg font-black truncate">Mis planes</h1>
          </div>
          {!showForm && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110 shrink-0"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              <Plus size={15} />
              Nuevo plan
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <p className="text-xs text-stone-500">
          Los clientes verán estos planes con su precio en tu perfil público y elegirán uno al solicitarte como coach.
          El cobro se hace fuera de la app; tú solo confirmas el pago de recibido.
        </p>

        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-4 text-sm text-red-400">{error}</div>
        )}

        {/* ── Formulario crear / editar ── */}
        {showForm && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{editingId ? 'Editar plan' : 'Nuevo plan'}</p>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-400 block mb-1.5">Nombre del plan</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej. Plan mensual con seguimiento"
                maxLength={200}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:border-lime-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1.5">Precio (MXN)</label>
                <input
                  type="number"
                  min="0"
                  max="9999999"
                  step="50"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="800"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:border-lime-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1.5">Periodicidad</label>
                <select
                  value={form.interval}
                  onChange={e => setForm(f => ({ ...f, interval: e.target.value as PlanInterval }))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none transition-colors"
                >
                  {INTERVALS.map(i => (
                    <option key={i} value={i}>{PLAN_INTERVAL_LABELS[i]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-400 block mb-1.5">Descripción (opcional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Qué incluye: rutina personalizada, seguimiento semanal, ajustes de nutrición..."
                rows={3}
                maxLength={1000}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:border-lime-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-stone-950 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {editingId ? 'Guardar cambios' : 'Crear plan'}
            </button>
            {!canSave && (
              <p className="text-xs text-stone-500 text-center">
                {!form.name.trim() && !(parseFloat(form.price) > 0)
                  ? 'Falta el nombre y un precio mayor a 0.'
                  : !form.name.trim()
                  ? 'Falta el nombre del plan.'
                  : 'El precio debe ser mayor a 0.'}
              </p>
            )}
          </div>
        )}

        {/* ── Lista ── */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : plans.length === 0 && !showForm ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-10 text-center space-y-4">
            <CreditCard size={32} className="text-stone-600 mx-auto" />
            <p className="text-white font-bold">Sin planes todavía</p>
            <p className="text-sm text-stone-400">
              Crea tu primer plan con precio para que los clientes lo elijan al solicitarte.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-950"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              <Plus size={15} /> Crear plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-stone-900 border rounded-2xl p-4 transition-colors ${plan.is_active ? 'border-stone-800' : 'border-stone-800 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white truncate">{plan.name}</p>
                      {!plan.is_active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-stone-800 text-stone-500 flex items-center gap-1">
                          <EyeOff size={9} /> Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-lime-400 font-black text-lg mt-0.5">
                      {fmtPlanPrice(plan.price, plan.currency)}
                      <span className="text-xs font-medium text-stone-500">{PLAN_INTERVAL_SUFFIX[plan.interval]}</span>
                    </p>
                    {plan.description && (
                      <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(plan)}
                      disabled={togglingId === plan.id}
                      className="p-2 rounded-lg text-stone-400 hover:text-yellow-400 hover:bg-stone-800 transition-all disabled:opacity-50"
                      title={plan.is_active ? 'Ocultar del perfil' : 'Mostrar en el perfil'}
                    >
                      {togglingId === plan.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : plan.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => openEdit(plan)}
                      className="p-2 rounded-lg text-stone-400 hover:text-lime-400 hover:bg-stone-800 transition-all"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(plan.id)}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-all"
                      title="Borrar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {confirmDeleteId === plan.id && (
                  <div className="mt-3 flex items-center gap-2 text-sm border-t border-stone-800 pt-3">
                    <span className="text-stone-400 flex-1">¿Borrar este plan? Las solicitudes existentes lo conservan.</span>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletingId === plan.id}
                      className="px-3 py-1 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-400 disabled:opacity-50"
                    >
                      {deletingId === plan.id ? <Loader2 size={12} className="animate-spin" /> : 'Borrar'}
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
