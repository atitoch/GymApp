import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2, Save, FileText, Upload, ExternalLink } from 'lucide-react';
import { getMyCoachProfile, updateMyCoachProfile } from '../../services/coachDashboard';
import {
  getMyDocuments,
  getCertificationUploadUrl,
  registerCertification,
  uploadFileToStorage,
  getMyDocumentSignedUrl,
  type CoachDocument,
} from '../../services/coach';

const DOC_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'En revisión', cls: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' },
  approved: { label: 'Aprobado',    cls: 'bg-lime-400/10 text-lime-400 border border-lime-400/30' },
  rejected: { label: 'Rechazado',   cls: 'bg-red-400/10 text-red-400 border border-red-400/30' },
};

export const CoachProfileEditor: React.FC = () => {
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Documentos de certificación (archivos, revisados por el admin)
  const [documents, setDocuments] = useState<CoachDocument[]>([]);
  const [docLabel, setDocLabel] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyCoachProfile()
      .then((p) => {
        setBio(p.bio ?? '');
        setSpecialization(p.specialization ?? '');
        setYearsExperience(p.years_experience != null ? String(p.years_experience) : '');
        setHourlyRate(p.hourly_rate != null ? String(p.hourly_rate) : '');
        setCertifications(p.certifications ?? []);
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));

    getMyDocuments().then(setDocuments).catch(() => {});
  }, []);

  const handleUploadDocument = async (file: File) => {
    setDocError(null);
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setDocError('Solo se permiten PDF, JPG, PNG o WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError('El archivo no puede superar 10 MB.');
      return;
    }
    setUploadingDoc(true);
    try {
      const { upload_url, path } = await getCertificationUploadUrl({
        file_name: file.name,
        content_type: file.type,
      });
      await uploadFileToStorage(upload_url, file);
      const doc = await registerCertification({
        file_url: path,
        file_name: file.name,
        label: docLabel.trim() || undefined,
      });
      setDocuments((prev) => [doc, ...prev]);
      setDocLabel('');
    } catch (e: any) {
      setDocError(e?.message ?? 'Error al subir el documento.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleViewDocument = async (doc: CoachDocument) => {
    try {
      const url = await getMyDocumentSignedUrl(doc.file_url);
      window.open(url, '_blank');
    } catch {
      setDocError('No se pudo abrir el documento.');
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      // null (no undefined): undefined se omite del JSON y el backend nunca
      // recibe el borrado — por eso "borrar la bio" no persistía.
      await updateMyCoachProfile({
        bio: bio.trim() || null,
        specialization: specialization.trim() || null,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        certifications: certifications.filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const updateCert = (i: number, val: string) =>
    setCertifications((prev) => prev.map((c, idx) => idx === i ? val : c));
  const removeCert = (i: number) =>
    setCertifications((prev) => prev.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 size={28} className="text-lime-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20">
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/coach')} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-black flex-1">Mi perfil de entrenador</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-stone-950 disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: saved ? '#86efac' : 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
        )}

        {/* Especialización */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Especialización</label>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Ej. Fuerza y acondicionamiento"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Años de experiencia</label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="0"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Tarifa por hora ($)</label>
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="0"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <label className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1.5">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntale a tus clientes quién eres y cuál es tu enfoque de entrenamiento..."
            rows={4}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 resize-none focus:outline-none focus:border-lime-400"
          />
        </div>

        {/* Certificaciones */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Certificaciones</label>
            <button
              onClick={() => setCertifications((prev) => [...prev, ''])}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-lime-400 transition-colors"
            >
              <Plus size={13} /> Agregar
            </button>
          </div>
          {certifications.length === 0 && (
            <p className="text-xs text-stone-600 italic">Sin certificaciones agregadas</p>
          )}
          {certifications.map((cert, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={cert}
                onChange={(e) => updateCert(i, e.target.value)}
                placeholder="Ej. NSCA-CSCS, ACE Personal Trainer..."
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
              />
              <button onClick={() => removeCert(i)} className="p-2 text-stone-500 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Documentos de certificación (archivos) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Documentos de certificación</label>
            <p className="text-xs text-stone-600 mt-1">
              Sube tus certificados en PDF o imagen. El equipo los revisa antes de aprobarlos.
            </p>
          </div>

          {docError && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-xs text-red-400">{docError}</div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={docLabel}
              onChange={(e) => setDocLabel(e.target.value)}
              placeholder="Nombre del certificado (opcional)"
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-lime-400"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadDocument(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-stone-950 disabled:opacity-60 transition-all hover:brightness-110 shrink-0"
              style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
            >
              {uploadingDoc ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Subir
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-stone-600 italic">Sin documentos subidos</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const meta = DOC_STATUS_META[doc.status ?? 'pending'] ?? DOC_STATUS_META.pending;
                return (
                  <div key={doc.id} className="flex items-center gap-2 bg-stone-800/60 border border-stone-700/60 rounded-xl px-3 py-2">
                    <FileText size={14} className="text-stone-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-200 truncate">
                        {doc.label || doc.file_name || doc.document_type}
                      </p>
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <p className="text-xs text-red-400/80 truncate">{doc.rejection_reason}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>
                      {meta.label}
                    </span>
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="p-1.5 text-stone-500 hover:text-lime-400 transition-colors shrink-0"
                      title="Ver documento"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
