import { authenticatedGet, authenticatedPost, authenticatedPut } from '../utils/api';

export interface CoachProfile {
  id: string;
  bio?: string;
  specialization?: string;
  certifications?: string[];
  years_experience?: number;
  hourly_rate?: number;
  users?: { first_name?: string; last_name?: string; email: string };
}

export interface ClientRelationship {
  id: string;
  user_id: string;
  status: string;
  started_at?: string;
  users?: { id: string; first_name?: string; last_name?: string; email: string };
}

export interface CoachComment {
  id: string;
  coach_id: string;
  user_id: string;
  comment: string;
  comment_type: string;
  is_private: boolean;
  created_at: string;
}

export interface CoachRoutine {
  id: string;
  name: string;
  total_days?: number;
  is_cyclic: boolean;
}

export const getMyCoachProfile = () => authenticatedGet<CoachProfile>('/coach/profile');
export const updateMyCoachProfile = (data: Partial<CoachProfile>) => authenticatedPut<CoachProfile>('/coach/profile', data);
export const getMyClients = () => authenticatedGet<ClientRelationship[]>('/coach/clients');
export const getPendingRequests = () => authenticatedGet<ClientRelationship[]>('/coach/connections/pending');
export const acceptRequest = (id: string) => authenticatedPost(`/coach/connections/${id}/accept`, {});
export const rejectRequest = (id: string) => authenticatedPost(`/coach/connections/${id}/reject`, {});
export const getClientDetail = (userId: string) => authenticatedGet<any>(`/coach/clients/${userId}`);
export const addComment = (userId: string, data: { comment: string; comment_type: string; is_private?: boolean }) => authenticatedPost<CoachComment>(`/coach/clients/${userId}/comments`, data);
export const getClientComments = (userId: string) => authenticatedGet<CoachComment[]>(`/coach/clients/${userId}/comments`);
export const assignRoutine = (userId: string, routineId: string) => authenticatedPost(`/coach/clients/${userId}/assign-routine`, { routine_id: routineId });
export const getMyRoutines = () => authenticatedGet<CoachRoutine[]>('/coach/routines');
export interface MyCoachData {
  coach: (CoachProfile & { relationship_id: string; connected_since?: string }) | null;
  comments: { id: string; comment: string; comment_type: string; created_at: string }[];
  assigned_routine: { id: string; name: string; total_days?: number; is_cyclic: boolean } | null;
}

export const getMyCoach = () => authenticatedGet<MyCoachData>('/coaches/my-coach');
export const listCoaches = () => authenticatedGet<any[]>('/coaches');
export const getCoachPublicProfile = (coachId: string) => authenticatedGet<{ coach: CoachProfile & { users?: { first_name?: string; last_name?: string } } }>(`/coaches/${coachId}`);
export const requestConnection = (coachId: string) => authenticatedPost(`/coaches/${coachId}/connect`, {});
export const getMyConnections = () => authenticatedGet<any[]>('/coaches/my-connections');
