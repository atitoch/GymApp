import { authenticatedGet, authenticatedPost } from '../utils/api';

export interface AdminStats {
  users: { total: number; byRole: Record<string, number> };
  applications: { pending: number; approved: number; rejected: number };
  routines: { total: number };
}

export interface AdminUser {
  id: string; email: string; first_name?: string; last_name?: string;
  role: string; coach_status?: string; created_at: string;
}

export interface CoachApplication {
  id: string; user_id: string; status: string; submitted_at: string;
  reviewed_at?: string; rejection_reason?: string;
  users?: { email: string; first_name?: string; last_name?: string };
  coach_documents?: { id: string; document_type: string; file_url: string; file_name?: string }[];
}

export interface MemoryUsage {
  rss: number; heapTotal: number; heapUsed: number; external: number; arrayBuffers: number;
}

export interface SystemHealth {
  uptime: number; memoryUsage: MemoryUsage; nodeVersion: string;
  timestamp: string; dbLatencyMs: number;
}

export interface AuthEvent {
  id: string; user_id?: string; email?: string; event_type: string;
  ip_address?: string; user_agent?: string; created_at: string;
}

export interface AuthEventsSummary {
  last24h: Record<string, number>;
  last7d: Record<string, number>;
}

export const getAdminStats = () => authenticatedGet<AdminStats>('/admin/stats');
export interface Pagination {
  page: number; limit: number; total: number; pages: number;
}

export const getAdminUsers = (params?: { role?: string; limit?: number; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.page != null) qs.set('page', String(params.page));
  return authenticatedGet<{ users: AdminUser[]; pagination: Pagination }>(`/admin/users${qs.toString() ? '?' + qs : ''}`);
};
export const getAdminCoaches = async (): Promise<AdminUser[]> => {
  const res = await authenticatedGet<{ coaches: AdminUser[] }>('/admin/coaches');
  return res.coaches ?? [];
};
export const getCoachApplications = async (status?: string): Promise<CoachApplication[]> => {
  const res = await authenticatedGet<{ applications: CoachApplication[] }>(`/admin/applications${status ? '?status=' + status : ''}`);
  return res.applications ?? [];
};
export const getCoachApplicationById = async (id: string): Promise<CoachApplication> => {
  const res = await authenticatedGet<{ application: CoachApplication }>(`/admin/applications/${id}`);
  return res.application;
};
export const approveApplication = (id: string) =>
  authenticatedPost<CoachApplication>(`/admin/applications/${id}/approve`, {});
export const rejectApplication = (id: string, reason: string) =>
  authenticatedPost<CoachApplication>(`/admin/applications/${id}/reject`, { reason });
export const getSystemHealth = () => authenticatedGet<SystemHealth>('/admin/health');
export const getAuthEvents = (params?: { event_type?: string; email?: string; limit?: number; page?: number }) => {
  const qs = new URLSearchParams();
  if (params?.event_type) qs.set('event_type', params.event_type);
  if (params?.email) qs.set('email', params.email);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.page != null) qs.set('page', String(params.page));
  return authenticatedGet<{ events: AuthEvent[]; pagination: Pagination }>(`/admin/auth-events${qs.toString() ? '?' + qs : ''}`);
};
export const getAuthEventsSummary = () =>
  authenticatedGet<AuthEventsSummary>('/admin/auth-events/summary');
