import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from '../utils/api';

export interface CoachProfile {
  id: string;
  bio?: string;
  specialization?: string;
  certifications?: string[];
  years_experience?: number;
  hourly_rate?: number;
  users?: { id?: string; first_name?: string; last_name?: string; email: string };
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

export interface MyCoachData {
  coach: (CoachProfile & { relationship_id: string; connected_since?: string }) | null;
  comments: { id: string; comment: string; comment_type: string; created_at: string }[];
  assigned_routine: { id: string; name: string; total_days?: number; is_cyclic: boolean } | null;
}

export const getMyCoachProfile = () => authenticatedGet<CoachProfile>('/coach/profile');
export const updateMyCoachProfile = (data: Partial<CoachProfile>) => authenticatedPut<CoachProfile>('/coach/profile', data);

export const getMyClients = async (): Promise<ClientRelationship[]> => {
  const res = await authenticatedGet<{ clients: ClientRelationship[] }>('/coach/clients');
  return res.clients ?? [];
};

export const getPendingRequests = async (): Promise<ClientRelationship[]> => {
  const res = await authenticatedGet<{ requests: ClientRelationship[] }>('/coach/connections/pending');
  return res.requests ?? [];
};

export const acceptRequest = (id: string) => authenticatedPost(`/coach/connections/${id}/accept`, {});
export const rejectRequest = (id: string) => authenticatedPost(`/coach/connections/${id}/reject`, {});
export const getClientDetail = (userId: string) => authenticatedGet<any>(`/coach/clients/${userId}`);

export const addComment = async (userId: string, data: { comment: string; comment_type: string; is_private?: boolean }): Promise<CoachComment> => {
  const res = await authenticatedPost<{ comment: CoachComment }>(`/coach/clients/${userId}/comments`, data);
  return res.comment;
};

export const getClientComments = async (userId: string): Promise<CoachComment[]> => {
  const res = await authenticatedGet<{ comments: CoachComment[] }>(`/coach/clients/${userId}/comments`);
  return res.comments ?? [];
};

export const updateComment = async (
  userId: string,
  commentId: string,
  data: { comment?: string; comment_type?: string; is_private?: boolean },
): Promise<CoachComment> => {
  const res = await authenticatedPut<{ comment: CoachComment }>(`/coach/clients/${userId}/comments/${commentId}`, data);
  return res.comment;
};

export const deleteComment = async (userId: string, commentId: string): Promise<void> => {
  await authenticatedDelete(`/coach/clients/${userId}/comments/${commentId}`);
};

export const assignRoutine = (userId: string, routineId: string, startMode: 'today' | 'monday' = 'monday') =>
  authenticatedPost(`/coach/clients/${userId}/assign-routine`, { routine_id: routineId, start_mode: startMode });

export const getMyRoutines = async (): Promise<CoachRoutine[]> => {
  const res = await authenticatedGet<{ routines: CoachRoutine[] }>('/coach/routines');
  return res.routines ?? [];
};

export const getMyCoach = () => authenticatedGet<MyCoachData>('/coaches/my-coach');

export const listCoaches = async (): Promise<any[]> => {
  const res = await authenticatedGet<{ coaches: any[] }>('/coaches');
  return res.coaches ?? [];
};

export const getCoachPublicProfile = (coachId: string) =>
  authenticatedGet<{ coach: CoachProfile & { users?: { first_name?: string; last_name?: string } } }>(`/coaches/${coachId}`);

export const requestConnection = (coachId: string) => authenticatedPost(`/coaches/${coachId}/connect`, {});

export const getMyConnections = async (): Promise<any[]> => {
  const res = await authenticatedGet<{ connections: any[] }>('/coaches/my-connections');
  return res.connections ?? [];
};
