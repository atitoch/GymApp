import { authenticatedGet, authenticatedPost } from '../utils/api';

export interface CoachApplication {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface CoachDocument {
  id: string;
  application_id: string | null;
  coach_id?: string | null;
  document_type: 'certification' | 'id' | 'diploma' | 'other';
  file_url: string;
  file_name?: string;
  label?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  uploaded_at: string;
}

export interface MyApplication {
  application: CoachApplication;
  documents: CoachDocument[];
}

export const applyAsCoach = async (): Promise<CoachApplication> => {
  const res = await authenticatedPost<{ application: CoachApplication }>('/coach/apply', {});
  return res.application;
};

export const getMyApplication = async (): Promise<MyApplication> => {
  const res = await authenticatedGet<{ application: CoachApplication & { coach_documents?: CoachDocument[] }; documents?: CoachDocument[] }>('/coach/application');
  // Backend now returns { application, documents } but handle legacy shape where
  // documents were nested as application.coach_documents
  const documents = res.documents ?? (res.application as any).coach_documents ?? [];
  const { coach_documents: _, ...application } = res.application as any;
  return { application, documents };
};

export const uploadCoachDocument = async (data: {
  application_id: string;
  document_type: CoachDocument['document_type'];
  file_url: string;
  file_name?: string;
}): Promise<CoachDocument> => {
  const res = await authenticatedPost<{ document: CoachDocument }>('/coach/documents', data);
  return res.document;
};

export const getUploadUrl = (data: {
  application_id: string;
  document_type: CoachDocument['document_type'];
  file_name: string;
  content_type: string;
}) =>
  authenticatedPost<{ upload_url: string; token: string; path: string }>(
    '/coach/storage/upload-url',
    data,
  );

export const uploadFileToStorage = async (uploadUrl: string, file: File): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error('Error al subir el archivo a Storage');
};

// ── Certificaciones del coach (post-aprobación, revisadas por admin) ─────────

export const getMyDocuments = async (): Promise<CoachDocument[]> => {
  const res = await authenticatedGet<{ documents: CoachDocument[] }>('/coach/documents');
  return res.documents ?? [];
};

export const getCertificationUploadUrl = (data: { file_name: string; content_type: string }) =>
  authenticatedPost<{ upload_url: string; token: string; path: string }>(
    '/coach/documents/upload-url',
    data,
  );

export const registerCertification = async (data: {
  file_url: string;
  file_name?: string;
  label?: string;
}): Promise<CoachDocument> => {
  const res = await authenticatedPost<{ document: CoachDocument }>('/coach/certifications', data);
  return res.document;
};

export const getMyDocumentSignedUrl = async (path: string): Promise<string> => {
  const res = await authenticatedGet<{ url: string }>(
    `/coach/documents/signed-url?path=${encodeURIComponent(path)}`,
  );
  return res.url;
};
