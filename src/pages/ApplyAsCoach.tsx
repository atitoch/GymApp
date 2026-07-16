import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import {
  ArrowLeft,
  Dumbbell,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  CreditCard,
  BookOpen,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';
import {
  applyAsCoach,
  getMyApplication,
  uploadCoachDocument,
  getUploadUrl,
  uploadFileToStorage,
  type CoachApplication,
  type CoachDocument,
} from '../services/coach';

type Step = 'loading' | 'intro' | 'documents' | 'status';

interface PendingFile {
  key: 'certification' | 'id' | 'diploma';
  label: string;
  required: boolean;
  file: File | null;
  status: 'idle' | 'uploading' | 'done' | 'error';
  error?: string;
}

const DOCUMENT_SLOTS: Omit<PendingFile, 'status' | 'file'>[] = [
  { key: 'certification', label: 'Certificación de entrenador', required: true },
  { key: 'id', label: 'Identificación oficial', required: true },
  { key: 'diploma', label: 'Diploma o curso complementario', required: false },
];

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp';
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const StatusBadge = ({ status }: { status: CoachApplication['status'] }) => {
  if (status === 'pending')
    return (
      <span className="rounded-full px-3 py-1 text-sm font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
        Pendiente
      </span>
    );
  if (status === 'approved')
    return (
      <span className="rounded-full px-3 py-1 text-sm font-medium bg-lime-400/10 text-lime-400 border border-lime-400/30">
        Aprobada
      </span>
    );
  return (
    <span className="rounded-full px-3 py-1 text-sm font-medium bg-red-400/10 text-red-400 border border-red-400/30">
      Rechazada
    </span>
  );
};

export const ApplyAsCoach: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [application, setApplication] = useState<CoachApplication | null>(null);
  const [documents, setDocuments] = useState<CoachDocument[]>([]);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [files, setFiles] = useState<PendingFile[]>(
    DOCUMENT_SLOTS.map((s) => ({ ...s, file: null, status: 'idle' })),
  );

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    getMyApplication()
      .then((data) => {
        setApplication(data.application);
        setDocuments(data.documents);
        setStep('status');
      })
      .catch(() => setStep('intro'));
  }, []);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      const app = await applyAsCoach();
      setApplication(app);
      setDocuments([]);
      setStep('documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud.');
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (key: PendingFile['key'], file: File | null) => {
    if (file) {
      if (!ALLOWED_MIME.includes(file.type)) {
        setFiles((prev) =>
          prev.map((f) => (f.key === key ? { ...f, file: null, status: 'error', error: 'Solo se permiten PDF, JPG, PNG o WEBP' } : f)),
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prev) =>
          prev.map((f) => (f.key === key ? { ...f, file: null, status: 'error', error: 'El archivo supera el límite de 10 MB' } : f)),
        );
        return;
      }
    }
    setFiles((prev) =>
      prev.map((f) => (f.key === key ? { ...f, file, status: 'idle', error: undefined } : f)),
    );
  };

  const handleUploadAll = async () => {
    if (!application) return;

    const required = files.filter((f) => f.required && !f.file);
    if (required.length > 0) {
      setError('Debes subir los documentos requeridos (certificación e identificación).');
      return;
    }

    setError(null);
    setSubmitting(true);

    const toUpload = files.filter((f) => f.file !== null);

    let allOk = true;

    for (const slot of toUpload) {
      const file = slot.file!;

      setFiles((prev) =>
        prev.map((f) => (f.key === slot.key ? { ...f, status: 'uploading' } : f)),
      );

      try {
        const { upload_url, path } = await getUploadUrl({
          application_id: application.id,
          document_type: slot.key,
          file_name: file.name,
          content_type: file.type,
        });

        await uploadFileToStorage(upload_url, file);

        await uploadCoachDocument({
          application_id: application.id,
          document_type: slot.key,
          file_url: path,
          file_name: file.name,
        });

        setFiles((prev) =>
          prev.map((f) => (f.key === slot.key ? { ...f, status: 'done' } : f)),
        );
      } catch (err) {
        allOk = false;
        const msg = err instanceof Error ? err.message : 'Error al subir';
        setFiles((prev) =>
          prev.map((f) => (f.key === slot.key ? { ...f, status: 'error', error: msg } : f)),
        );
      }
    }

    setSubmitting(false);

    if (allOk) {
      setTimeout(() => setStep('status'), 800);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pb-20">
      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(12,10,9,0.90)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/dashboard'); }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-white">Conviértete en entrenador</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {step === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-lime-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Intro */}
        {step === 'intro' && (
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                <Dumbbell size={24} className="text-lime-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Conviértete en entrenador</h2>
                <p className="text-sm text-stone-400">Comparte tu experiencia con otros</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Para convertirte en entrenador en GymApp necesitas enviar documentación que
              acredite que eres un entrenador certificado. Una vez revisada tu solicitud,
              te notificaremos con la respuesta.
            </p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Award size={14} className="text-lime-400 shrink-0" />
                Certificación oficial de entrenador personal
              </li>
              <li className="flex items-center gap-2">
                <CreditCard size={14} className="text-lime-400 shrink-0" />
                Identificación oficial vigente
              </li>
              <li className="flex items-center gap-2">
                <BookOpen size={14} className="text-lime-400 shrink-0" />
                Diplomas o cursos complementarios (opcional)
              </li>
            </ul>
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-3 rounded-2xl text-sm font-bold text-stone-950 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              {applying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Iniciar solicitud'
              )}
            </button>
          </div>
        )}

        {/* Document upload */}
        {step === 'documents' && (
          <div className="space-y-4">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                  <FileText size={24} className="text-lime-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Sube tus documentos</h2>
                  <p className="text-sm text-stone-400">PDF, JPG, PNG o WEBP · máx. 10 MB</p>
                </div>
              </div>

              <div className="space-y-3">
                {files.map((slot) => (
                  <div key={slot.key} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
                      {slot.key === 'certification' && <Award size={12} className="text-lime-400" />}
                      {slot.key === 'id' && <CreditCard size={12} className="text-lime-400" />}
                      {slot.key === 'diploma' && <BookOpen size={12} className="text-lime-400" />}
                      {slot.label}
                      {slot.required && <span className="text-lime-400">*</span>}
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept={ACCEPTED}
                      className="hidden"
                      ref={(el) => { inputRefs.current[slot.key] = el; }}
                      onChange={(e) => handleFileChange(slot.key, e.target.files?.[0] ?? null)}
                    />

                    {slot.status === 'done' ? (
                      <div className="flex items-center gap-2 bg-lime-400/10 border border-lime-400/30 rounded-xl px-4 py-3">
                        <Check size={14} className="text-lime-400 shrink-0" />
                        <span className="text-sm text-lime-400 truncate">{slot.file?.name}</span>
                      </div>
                    ) : slot.file ? (
                      <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3">
                        <FileText size={14} className="text-stone-400 shrink-0" />
                        <span className="text-sm text-stone-300 truncate flex-1">{slot.file.name}</span>
                        {slot.status === 'uploading' ? (
                          <Loader2 size={14} className="text-lime-400 animate-spin shrink-0" />
                        ) : (
                          <button
                            onClick={() => handleFileChange(slot.key, null)}
                            className="text-stone-500 hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => inputRefs.current[slot.key]?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-stone-800/50 border border-dashed border-stone-700 hover:border-lime-400/50 hover:bg-stone-800 rounded-xl px-4 py-3 text-sm text-stone-500 hover:text-stone-300 transition-all"
                      >
                        <Upload size={14} />
                        Seleccionar archivo
                      </button>
                    )}

                    {slot.status === 'error' && (
                      <p className="text-xs text-red-400">{slot.error}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadAll}
                disabled={submitting || files.every((f) => !f.file)}
                className="w-full py-3 rounded-2xl text-sm font-bold text-stone-950 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Enviar documentos
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        {step === 'status' && application && (
          <div className="space-y-4">
            <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white">Tu solicitud</h2>
                <StatusBadge status={application.status} />
              </div>

              {application.status === 'pending' && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Tu solicitud está siendo revisada. Te notificaremos cuando tengamos
                    una respuesta.
                  </p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-lime-400 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-sm text-stone-400 leading-relaxed">
                      ¡Felicidades! Ya eres entrenador en GymApp.
                    </p>
                    {user?.role !== 'coach' ? (
                      <button
                        onClick={async () => { await refreshAuth(); navigate('/coach'); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-stone-950"
                        style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                      >
                        Activar perfil de coach
                      </button>
                    ) : (
                      <Link
                        to="/coach"
                        className="inline-block px-4 py-2 rounded-xl text-sm font-bold text-stone-950"
                        style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                      >
                        Ir al panel de coach
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="flex items-start gap-3">
                  <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-sm text-stone-400 leading-relaxed">
                      Tu solicitud no fue aprobada.
                    </p>
                    {application.rejection_reason && (
                      <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                        {application.rejection_reason}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setApplication(null);
                        setDocuments([]);
                        setFiles(DOCUMENT_SLOTS.map((s) => ({ ...s, file: null, status: 'idle' as const })));
                        setError(null);
                        setStep('intro');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 transition-all hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
                    >
                      Volver a aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {documents.length > 0 && (
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Documentos enviados
                </p>
                <ul className="space-y-2">
                  {documents.map((doc) => {
                    const statusColor =
                      doc.status === 'approved' ? 'text-lime-400'
                      : doc.status === 'rejected' ? 'text-red-400'
                      : 'text-stone-500';
                    const StatusIcon =
                      doc.status === 'approved' ? CheckCircle
                      : doc.status === 'rejected' ? XCircle
                      : Clock;
                    return (
                      <li key={doc.id} className="space-y-0.5">
                        <div className="flex items-center gap-2 text-sm text-stone-400">
                          <FileText size={14} className="text-stone-500 shrink-0" />
                          <span className="flex-1 truncate">{doc.file_name ?? doc.document_type}</span>
                          <StatusIcon size={14} className={`shrink-0 ${statusColor}`} />
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <p className="text-xs text-red-400 pl-5">{doc.rejection_reason}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
