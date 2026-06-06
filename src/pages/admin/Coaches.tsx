import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAdminCoaches, updateCoachStatus, type AdminUser } from '../../services/admin';

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'approved' | 'suspended';

interface ConfirmState {
  coach: AdminUser;
  action: 'suspend' | 'reactivate';
}

const StatusBadge: React.FC<{ status?: string; isActive?: boolean }> = ({ status, isActive }) => {
  const suspended = status === 'suspended' || isActive === false;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
      suspended
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-lime-400/10 text-lime-400 border-lime-400/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${suspended ? 'bg-red-400' : 'bg-lime-400'}`} />
      {suspended ? 'suspendido' : 'activo'}
    </span>
  );
};

const ConfirmModal: React.FC<{
  state: ConfirmState;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ state, loading, onConfirm, onCancel }) => {
  const { coach, action } = state;
  const name = [coach.first_name, coach.last_name].filter(Boolean).join(' ') || coach.email;
  const isSuspend = action === 'suspend';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors">
          <X size={18} />
        </button>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isSuspend ? 'bg-red-500/15' : 'bg-lime-400/15'}`}>
          {isSuspend
            ? <ShieldOff className="w-5 h-5 text-red-400" />
            : <ShieldCheck className="w-5 h-5 text-lime-400" />}
        </div>
        <h3 className="text-stone-100 font-semibold mb-1">
          {isSuspend ? 'Suspender coach' : 'Reactivar coach'}
        </h3>
        <p className="text-stone-400 text-sm mb-6">
          {isSuspend
            ? `¿Suspender a ${name}? No podrá acceder al panel de coach ni aparecer en el directorio.`
            : `¿Reactivar a ${name}? Recuperará acceso al panel y aparecerá en el directorio.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              isSuspend
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-lime-400/20 text-lime-400 hover:bg-lime-400/30 border border-lime-400/30'
            }`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isSuspend ? 'Suspender' : 'Reactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminCoaches: React.FC = () => {
  const navigate = useNavigate();
  const [all, setAll] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    getAdminCoaches()
      .then(data => setAll(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar coaches'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return all.filter(c => {
      const matchesSearch = !q
        || c.email.toLowerCase().includes(q)
        || [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase().includes(q);
      const isSuspended = c.coach_status === 'suspended' || c.coaches?.is_active === false;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'suspended' && isSuspended)
        || (statusFilter === 'approved' && !isSuspended);
      return matchesSearch && matchesStatus;
    });
  }, [all, search, statusFilter]);

  useEffect(() => { setPage(0); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const coaches = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAction = (coach: AdminUser) => {
    const isSuspended = coach.coach_status === 'suspended' || coach.coaches?.is_active === false;
    setConfirm({ coach, action: isSuspended ? 'reactivate' : 'suspend' });
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    const newStatus = confirm.action === 'suspend' ? 'suspended' : 'approved';
    try {
      await updateCoachStatus(confirm.coach.id, newStatus);
      setAll(prev => prev.map(c =>
        c.id === confirm.coach.id
          ? { ...c, coach_status: newStatus, coaches: c.coaches ? { ...c.coaches, is_active: newStatus === 'approved' } : c.coaches }
          : c
      ));
      setToast({ msg: `Coach ${newStatus === 'approved' ? 'reactivado' : 'suspendido'} correctamente`, ok: newStatus === 'approved' });
      setConfirm(null);
    } catch {
      setToast({ msg: 'Error al actualizar el estado', ok: false });
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(() => ({
    all: all.length,
    approved: all.filter(c => c.coach_status !== 'suspended' && c.coaches?.is_active !== false).length,
    suspended: all.filter(c => c.coach_status === 'suspended' || c.coaches?.is_active === false).length,
  }), [all]);

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      {confirm && (
        <ConfirmModal
          state={confirm}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <div className={`fixed top-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all ${
          toast.ok
            ? 'bg-lime-400/10 text-lime-400 border-lime-400/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {toast.ok ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-100">Coaches</h1>
            <p className="text-stone-500 text-sm mt-0.5">{all.length} registrados</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-stone-600 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex rounded-xl border border-stone-800 overflow-hidden bg-stone-900 shrink-0">
            {(['all', 'approved', 'suspended'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-stone-700 text-stone-100'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'approved' ? 'Activos' : 'Suspendidos'}
                <span className={`ml-2 text-xs ${statusFilter === s ? 'text-stone-300' : 'text-stone-600'}`}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-20 text-stone-500 text-sm">
            {search || statusFilter !== 'all' ? 'Sin resultados para este filtro.' : 'No hay coaches registrados.'}
          </div>
        ) : (
          <>
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-stone-500 text-xs border-b border-stone-800">
                    <th className="text-left px-5 py-3 font-medium">Nombre</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Especialización</th>
                    <th className="text-left px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coaches.map(coach => {
                    const name = [coach.first_name, coach.last_name].filter(Boolean).join(' ') || '—';
                    const isSuspended = coach.coach_status === 'suspended' || coach.coaches?.is_active === false;
                    return (
                      <tr key={coach.id} className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors group">
                        <td className="px-5 py-3.5">
                          <p className="text-stone-100 font-medium">{name}</p>
                          <p className="text-stone-500 text-xs md:hidden">{coach.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-stone-400 hidden md:table-cell">{coach.email}</td>
                        <td className="px-5 py-3.5 text-stone-400 hidden lg:table-cell">
                          {coach.coaches?.specialization || <span className="text-stone-600">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={coach.coach_status} isActive={coach.coaches?.is_active} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleAction(coach)}
                            className={`opacity-0 group-hover:opacity-100 transition-all text-xs font-medium px-3 py-1.5 rounded-lg border ${
                              isSuspended
                                ? 'text-lime-400 border-lime-400/20 hover:bg-lime-400/10'
                                : 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                            }`}
                          >
                            {isSuspended ? 'Reactivar' : 'Suspender'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-700 transition-colors"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <p className="text-stone-500 text-xs">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
                </p>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-700 transition-colors"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
