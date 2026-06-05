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
  application_id: string;
  document_type: 'certification' | 'id' | 'diploma' | 'other';
  file_url: string;
  file_name?: string;
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
  const res = await authenticatedGet<{ application: CoachApplication; documents: CoachDocument[] }>('/coach/application');
  return { application: res.application, documents: res.documents ?? [] };
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
