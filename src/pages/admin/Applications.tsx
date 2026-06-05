import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Check, X, FileText, ExternalLink, User, Calendar,
} from 'lucide-react';
import {
  getCoachApplications,
  approveApplication,
  rejectApplication,
  type CoachApplication,
} from '../../services/admin';
import { authenticatedGet } from '../../utils/api';

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

const DOC_LABELS: Record<string, string> = {
  certification: 'Certificación',
  id: 'Identificación',
  diploma: 'Diploma',
  other: 'Otro',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const getSignedUrl = (path: string): Promise<string> =>
  authenticatedGet<{ url: string }>(`/admin/storage/signed-url?path=${encodeURIComponent(path)}`)
    .then(r => r.url);

interface DocLinkProps { doc: { id: string; document_type: string; file_url: string; file_name?: string } }
const DocLink: React.FC<DocLinkProps> = ({ doc }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (url) { window.open(url, '_blank'); return; }
    setLoading(true);
    try {
      const signed = await getSignedUrl(doc.file_url);
      setUrl(signed);
      window.open(signed, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
      {DOC_LABELS[doc.document_type] ?? doc.document_type}
      {doc.file_name && <span className="text-stone-500 text-xs">({doc.file_name})</span>}
      <ExternalLink size={12} className="text-stone-500" />
    </button>
  );
};

interface ModalProps {
  app: CoachApplication;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  loading: boolean;
}

const ApplicationModal: React.FC<ModalProps> = ({ app, onClose, onApprove, onReject, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const userName = [app.users?.first_name, app.users?.last_name].filter(Boolean).join(' ') || app.users?.email || app.user_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800">
          <h2 className="text-lg font-black text-white">Solicitud de coach</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Applicant info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center shrink-0">
              <User size={20} className="text-stone-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{userName}</p>
              <p className="text-stone-400 text-sm">{app.users?.email}</p>
            </div>
          </div>

          {/* Status + date */}
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass[app.status] ?? 'bg-stone-700 text-stone-300'}`}>
              {app.status === 'pending' ? 'Pendiente' : app.status === 'approved' ? 'Aprobada' : 'Rechazada'}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Calendar size={11} />
              Enviada el {formatDate(app.submitted_at)}
            </span>
          </div>

          {/* Documents */}
          <div className="bg-stone-800/60 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Documentos</p>
            {app.coach_documents && app.coach_documents.length > 0 ? (
              <div className="space-y-2">
                {app.coach_documents.map(doc => (
                  <DocLink key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">Sin documentos adjuntos.</p>
            )}
          </div>

          {/* Rejection reason (if rejected) */}
          {app.rejection_reason && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3">
              <p className="text-xs font-bold text-red-400 mb-1">Motivo de rechazo</p>
              <p className="text-sm text-red-300">{app.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          {app.status === 'pending' && (
            <div className="space-y-3 pt-1">
              {!rejectOpen ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onApprove(app.id)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-lime-400 text-stone-950 font-bold rounded-xl hover:bg-lime-300 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRejectOpen(true)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-400/10 text-red-400 border border-red-400/30 font-bold rounded-xl hover:bg-red-400/20 disabled:opacity-50 transition-colors"
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Motivo del rechazo (opcional)..."
                    rows={3}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-sm placeholder-stone-500 resize-none focus:outline-none focus:border-stone-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRejectOpen(false)}
                      className="flex-1 py-2.5 bg-stone-800 text-stone-300 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => onReject(app.id, rejectReason)}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Rechazando...' : 'Confirmar rechazo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CoachApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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
    setActionLoading(true);
    try {
      await approveApplication(id);
      setSelected(null);
      load();
    } catch {
      setError('Error al aprobar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(true);
    try {
      await rejectApplication(id, reason);
      setSelected(null);
      load();
    } catch {
      setError('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
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
              const userName = [app.users?.first_name, app.users?.last_name].filter(Boolean).join(' ') || app.users?.email || app.user_id;
              const docCount = app.coach_documents?.length ?? 0;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="w-full text-left bg-stone-900 border border-stone-800 hover:border-stone-600 rounded-2xl p-5 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-stone-100 font-bold">{userName}</p>
                    <p className="text-stone-400 text-sm">{app.users?.email}</p>
                    <p className="text-stone-500 text-xs">
                      {formatDate(app.submitted_at)} · {docCount} documento{docCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${statusBadgeClass[app.status] ?? 'bg-stone-700 text-stone-300'}`}>
                    {app.status === 'pending' ? 'Pendiente' : app.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <ApplicationModal
          app={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
