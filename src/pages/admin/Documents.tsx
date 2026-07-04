import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Check, X, ExternalLink } from 'lucide-react';
import {
  getAdminDocuments,
  approveDocument,
  rejectDocument,
  type AdminCoachDocument,
} from '../../services/admin';
import { authenticatedGet } from '../../utils/api';

type StatusFilter = 'pending' | 'approved' | 'rejected';

const FILTER_LABELS: Record<StatusFilter, string> = {
  pending: 'Pendientes',
  approved: 'Aprobados',
  rejected: 'Rechazados',
};

const STATUS_BADGE: Record<StatusFilter, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
  approved: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
  rejected: 'bg-red-400/10 text-red-400 border border-red-400/30',
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const AdminDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [documents, setDocuments] = useState<AdminCoachDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = (status: StatusFilter) => {
    setLoading(true);
    getAdminDocuments(status)
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleView = async (doc: AdminCoachDocument) => {
    try {
      const res = await authenticatedGet<{ url: string }>(
        `/admin/storage/signed-url?path=${encodeURIComponent(doc.file_url)}`,
      );
      window.open(res.url, '_blank');
    } catch { /* silencioso */ }
  };

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await approveDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {} finally { setActingId(null); }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      await rejectDocument(id, rejectReason.trim());
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch {} finally { setActingId(null); }
  };

  const ownerName = (doc: AdminCoachDocument) =>
    [doc.owner?.first_name, doc.owner?.last_name].filter(Boolean).join(' ') || doc.owner?.email || 'Desconocido';

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <FileText size={20} className="text-lime-400" />
          <h1 className="text-lg font-black">Documentos de coaches</h1>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {(Object.keys(FILTER_LABELS) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === s ? STATUS_BADGE[s] : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
              }`}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-lime-400 animate-spin" /></div>
        ) : documents.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
            <FileText size={32} className="text-stone-600 mx-auto mb-3" />
            <p className="font-bold text-white">Sin documentos {FILTER_LABELS[filter].toLowerCase()}</p>
            {filter === 'pending' && (
              <p className="text-sm mt-1">Cuando un coach suba una certificación nueva aparecerá aquí para revisión.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => handleView(doc)}
                  className="w-full text-left flex items-center gap-3 p-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-stone-800 shrink-0">
                    <FileText size={16} className="text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {doc.label || doc.file_name || doc.document_type}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {ownerName(doc)} · {fmtDate(doc.uploaded_at)}
                      {doc.application_id ? ' · de solicitud' : ' · post-aprobación'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-medium shrink-0">
                    <ExternalLink size={12} />
                    Ver
                  </div>
                </button>

                {doc.status === 'rejected' && doc.rejection_reason && (
                  <p className="mx-4 mb-3 text-xs text-red-400/80 bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                    {doc.rejection_reason}
                  </p>
                )}

                {filter === 'pending' && (
                  <div className="px-4 pb-4 pt-3 border-t border-stone-800">
                    {rejectingId === doc.id ? (
                      <div className="space-y-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Razón del rechazo (visible para el coach)"
                          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-red-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(doc.id)}
                            disabled={actingId === doc.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50 transition-colors"
                          >
                            {actingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirmar rechazo'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(doc.id)}
                          disabled={actingId === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-stone-950 text-xs font-bold hover:bg-lime-300 disabled:opacity-50 transition-colors"
                        >
                          {actingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Aprobar
                        </button>
                        <button
                          onClick={() => setRejectingId(doc.id)}
                          disabled={actingId === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/40 text-red-400 text-xs font-medium hover:bg-red-400/10 disabled:opacity-50 transition-colors"
                        >
                          <X size={12} />
                          Rechazar
                        </button>
                      </div>
                    )}
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
