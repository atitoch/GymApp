import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Loader2, Check, X } from 'lucide-react';
import {
  getCoachApplications,
  approveApplication,
  rejectApplication,
  type CoachApplication,
} from '../../services/admin';

type StatusFilter = 'pending' | 'approved' | 'rejected';

const statusLabel: Record<StatusFilter, string> = {
  pending: 'Pendientes',
  approved: 'Aprobadas',
  rejected: 'Rechazadas',
};

const statusBadgeClass: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
  approved: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
  rejected: 'bg-red-400/10 text-red-400 border border-red-400/30',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getCoachApplications(filter)
      .then(setApplications)
      .catch(() => setError('Error al cargar solicitudes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveApplication(id);
      load();
    } catch {
      setError('Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectApplication(id, rejectReason[id] ?? '');
      setRejectOpen(null);
      load();
    } catch {
      setError('Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-stone-100">Solicitudes de coaches</h1>

        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === s ? 'bg-lime-400 text-stone-950' : 'bg-stone-800 text-stone-400 hover:text-stone-100'}`}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <p className="text-stone-400 text-center py-12">No hay solicitudes {statusLabel[filter].toLowerCase()}.</p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const isExpanded = expanded === app.id;
              const userName = [app.users?.first_name, app.users?.last_name].filter(Boolean).join(' ') || app.users?.email || app.user_id;
              return (
                <div key={app.id} className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                  >
                    <div className="space-y-1">
                      <p className="text-stone-100 font-medium">{userName}</p>
                      <p className="text-stone-400 text-sm">{app.users?.email}</p>
                      <p className="text-stone-500 text-xs">Enviada: {formatDate(app.submitted_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass[app.status] ?? 'bg-stone-700 text-stone-300'}`}>
                        {app.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-stone-800 pt-4 space-y-4">
                      {/* Documents */}
                      {app.coach_documents && app.coach_documents.length > 0 ? (
                        <div>
                          <p className="text-stone-400 text-xs font-medium mb-2">Documentos</p>
                          <div className="space-y-2">
                            {app.coach_documents.map(doc => (
                              <a
                                key={doc.id}
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors"
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                {doc.file_name ?? doc.document_type}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-stone-500 text-sm">Sin documentos adjuntos.</p>
                      )}

                      {app.rejection_reason && (
                        <p className="text-sm text-red-400">Razón de rechazo: {app.rejection_reason}</p>
                      )}

                      {/* Actions — only for pending */}
                      {app.status === 'pending' && (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-2 px-4 py-2 bg-lime-400/10 text-lime-400 border border-lime-400/30 rounded-xl text-sm font-medium hover:bg-lime-400/20 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Aprobar
                            </button>
                            <button
                              onClick={() => setRejectOpen(rejectOpen === app.id ? null : app.id)}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-400/10 text-red-400 border border-red-400/30 rounded-xl text-sm font-medium hover:bg-red-400/20 transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>

                          {rejectOpen === app.id && (
                            <div className="space-y-2">
                              <textarea
                                value={rejectReason[app.id] ?? ''}
                                onChange={e => setRejectReason(prev => ({ ...prev, [app.id]: e.target.value }))}
                                placeholder="Motivo del rechazo..."
                                rows={3}
                                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-sm placeholder-stone-500 resize-none focus:outline-none focus:border-stone-600"
                              />
                              <button
                                onClick={() => handleReject(app.id)}
                                disabled={actionLoading === app.id || !rejectReason[app.id]?.trim()}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === app.id ? 'Rechazando...' : 'Confirmar rechazo'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
