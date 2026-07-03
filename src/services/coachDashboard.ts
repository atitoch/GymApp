import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, getAuthToken } from '../utils/api';
import { supabase } from '../config/supabase';

export interface CoachProfile {
  id: string;
  bio?: string;
  specialization?: string;
  certifications?: string[];
  years_experience?: number;
  hourly_rate?: number;
  users?: { id?: string; first_name?: string; last_name?: string; email: string; avatar_url?: string | null };
}

export interface ClientWorkoutStats {
  last_workout_at: string | null;
  workouts_last_7_days: number;
  workouts_last_30_days: number;
}

export interface ClientRelationship {
  id: string;
  user_id: string;
  status: string;
  started_at?: string;
  users?: { id: string; first_name?: string; last_name?: string; email: string; avatar_url?: string | null };
  plan_id?: string | null;
  plan?: Pick<CoachPlan, 'id' | 'name' | 'price' | 'currency' | 'interval'> | null;
  workout_stats?: ClientWorkoutStats;
}

// ── Planes de entrenamiento (precio que el cliente ve al solicitar) ──────────

export type PlanInterval = 'weekly' | 'monthly' | 'quarterly' | 'one_time';

export interface CoachPlan {
  id: string;
  coach_id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  is_active: boolean;
  created_at?: string;
}

export interface CoachPlanInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  interval: PlanInterval;
  is_active?: boolean;
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

export interface ExerciseInput {
  name: string;
  sets: string;
  reps: string;
  rpe: string;
  rest: string;
  notes?: string;
  exercise_catalog_id?: string | null;
}

export interface SectionInput {
  title: string;
  exercises: ExerciseInput[];
}

export interface DayRoutineInput {
  dayName: string;
  title: string;
  warmup?: string[];
  sections: SectionInput[];
  cooldown?: string[];
}

export interface RoutineTemplateInput {
  name: string;
  description?: string;
  isCyclic?: boolean;
  pattern: string[];
  routines: DayRoutineInput[];
}

export interface RoutineTemplateDetail {
  id: string;
  name: string;
  description?: string;
  isCyclic: boolean;
  totalDays: number;
  pattern: string[];
  routines: (DayRoutineInput & { id?: string })[];
}

export interface MyCoachData {
  coach: (CoachProfile & { relationship_id: string; connected_since?: string }) | null;
  comments: { id: string; comment: string; comment_type: string; created_at: string }[];
  assigned_routine: { id: string; name: string; total_days?: number; is_cyclic: boolean } | null;
}

export const getMyCoachProfile = () =>
  authenticatedGet<{ coach: CoachProfile }>('/coach/profile').then(r => r.coach);

/** Campos editables del perfil; null borra el valor en el backend */
export type CoachProfileUpdate = {
  [K in 'bio' | 'specialization' | 'certifications' | 'years_experience' | 'hourly_rate']?:
    CoachProfile[K] | null;
};
export const updateMyCoachProfile = async (data: CoachProfileUpdate): Promise<CoachProfile> => {
  const res = await authenticatedPut<{ coach: CoachProfile }>('/coach/profile', data);
  return res.coach;
};

export const getMyClients = async (): Promise<ClientRelationship[]> => {
  const res = await authenticatedGet<{ clients: ClientRelationship[] }>('/coach/clients');
  return res.clients ?? [];
};

export const getPendingRequests = async (): Promise<ClientRelationship[]> => {
  const res = await authenticatedGet<{ requests: ClientRelationship[] }>('/coach/connections/pending');
  return res.requests ?? [];
};

/** payment_received=true le pide al backend registrar el pago del plan como confirmado al aceptar */
export const acceptRequest = (id: string, opts?: { payment_received?: boolean }) =>
  authenticatedPost(`/coach/connections/${id}/accept`, opts ?? {});
export const rejectRequest = (id: string) => authenticatedPost(`/coach/connections/${id}/reject`, {});
export const getClientDetail = (userId: string) => authenticatedGet<any>(`/coach/clients/${userId}`);

export const disconnectClient = (userId: string) =>
  authenticatedPost<{ ended: boolean }>(`/coach/clients/${userId}/disconnect`, {});

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

/** Obtiene la rutina activa asignada a un cliente específico.
 * Usa el cliente Supabase directamente con el JWT del coach (OAuth o compatible).
 * Devuelve null si no hay rutina asignada o si el JWT no es Supabase-compatible. */
export const getClientActiveRoutine = async (userId: string): Promise<CoachRoutine | null> => {
  try {
    // Primero intenta con el cliente supabase-js (tiene sesión para OAuth users).
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const { data } = await supabase
        .from('routines')
        .select('id, name, total_days, is_cyclic')
        .eq('assigned_user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single();
      if (data) return data as CoachRoutine;

      // Fallback: cuentas antiguas (de antes del sistema de copias por cliente)
      // tienen users.routine_id apuntando directo a la rutina, sin assigned_user_id.
      const { data: userRow } = await supabase
        .from('users')
        .select('routine_id')
        .eq('id', userId)
        .maybeSingle();
      if (userRow?.routine_id) {
        const { data: directRoutine } = await supabase
          .from('routines')
          .select('id, name, total_days, is_cyclic')
          .eq('id', userRow.routine_id)
          .maybeSingle();
        if (directRoutine) return directRoutine as CoachRoutine;
      }
    }

    // Fallback: usa el token custom del backend directamente contra Supabase REST API.
    // Funciona si el backend emite JWTs firmados con el mismo secret de Supabase.
    const token = getAuthToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    if (!token || !supabaseUrl || !supabaseKey) return null;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/routines?select=id%2Cname%2Ctotal_days%2Cis_cyclic&assigned_user_id=eq.${encodeURIComponent(userId)}&is_active=eq.true&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` } },
    );
    if (res.ok) {
      const rows: CoachRoutine[] = await res.json();
      if (rows[0]) return rows[0];
    }

    const userRes = await fetch(
      `${supabaseUrl}/rest/v1/users?select=routine_id&id=eq.${encodeURIComponent(userId)}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` } },
    );
    if (!userRes.ok) return null;
    const userRows: { routine_id: string | null }[] = await userRes.json();
    const routineId = userRows[0]?.routine_id;
    if (!routineId) return null;

    const routineRes = await fetch(
      `${supabaseUrl}/rest/v1/routines?select=id%2Cname%2Ctotal_days%2Cis_cyclic&id=eq.${encodeURIComponent(routineId)}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` } },
    );
    if (!routineRes.ok) return null;
    const routineRows: CoachRoutine[] = await routineRes.json();
    return routineRows[0] ?? null;
  } catch {
    return null;
  }
};

export const getRoutineTemplate = async (routineId: string): Promise<RoutineTemplateDetail> => {
  const res = await authenticatedGet<{ routine: RoutineTemplateDetail }>(`/coach/routines/${routineId}`);
  return res.routine;
};

export const createRoutineTemplate = async (data: RoutineTemplateInput): Promise<string> => {
  const res = await authenticatedPost<{ routine_id: string }>('/coach/routines', data);
  return res.routine_id;
};

export const updateRoutineTemplate = async (routineId: string, data: Partial<RoutineTemplateInput>): Promise<string> => {
  const res = await authenticatedPut<{ routine_id: string }>(`/coach/routines/${routineId}`, data);
  return res.routine_id;
};

export const deleteRoutineTemplate = async (routineId: string): Promise<void> => {
  await authenticatedDelete(`/coach/routines/${routineId}`);
};

// ── Pagos coach ↔ cliente (solo registro, sin procesar cobros) ───────────────

export type PaymentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface CoachPayment {
  id: string;
  coach_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  concept?: string | null;
  payment_date: string;
  notes?: string | null;
  created_at: string;
  users?: { id: string; first_name?: string; last_name?: string; email: string };
}

export const getClientPayments = async (userId: string): Promise<CoachPayment[]> => {
  const res = await authenticatedGet<{ payments: CoachPayment[] }>(`/coach/clients/${userId}/payments`);
  return res.payments ?? [];
};

export const getAllMyPayments = async (): Promise<CoachPayment[]> => {
  const res = await authenticatedGet<{ payments: CoachPayment[] }>('/coach/payments');
  return res.payments ?? [];
};

export const createPayment = async (
  userId: string,
  data: { amount: number; status?: PaymentStatus; concept?: string; payment_date?: string; notes?: string; currency?: string },
): Promise<CoachPayment> => {
  const res = await authenticatedPost<{ payment: CoachPayment }>(`/coach/clients/${userId}/payments`, data);
  return res.payment;
};

export const updatePayment = async (
  paymentId: string,
  data: Partial<{ amount: number; status: PaymentStatus; concept: string; payment_date: string; notes: string }>,
): Promise<CoachPayment> => {
  const res = await authenticatedPut<{ payment: CoachPayment }>(`/coach/payments/${paymentId}`, data);
  return res.payment;
};

export const deletePayment = async (paymentId: string): Promise<void> => {
  await authenticatedDelete(`/coach/payments/${paymentId}`);
};

export const getMyCoach = () => authenticatedGet<MyCoachData>('/coaches/my-coach');

export const disconnectFromCoach = () =>
  authenticatedPost<{ ended: boolean }>('/coaches/disconnect', {});

export const listCoaches = async (): Promise<any[]> => {
  const res = await authenticatedGet<{ coaches: any[] }>('/coaches');
  return res.coaches ?? [];
};

export const getCoachPublicProfile = (coachId: string) =>
  authenticatedGet<{ coach: CoachProfile & { users?: { first_name?: string; last_name?: string; avatar_url?: string | null } } }>(`/coaches/${coachId}`);

export const requestConnection = (coachId: string, planId?: string) =>
  authenticatedPost(`/coaches/${coachId}/connect`, planId ? { plan_id: planId } : {});

// ── CRUD de planes (coach) + listado público ────────────────────────────────

export const getMyPlans = async (): Promise<CoachPlan[]> => {
  const res = await authenticatedGet<{ plans: CoachPlan[] }>('/coach/plans');
  return res.plans ?? [];
};

export const createPlan = async (data: CoachPlanInput): Promise<CoachPlan> => {
  const res = await authenticatedPost<{ plan: CoachPlan }>('/coach/plans', data);
  return res.plan;
};

export const updatePlan = async (planId: string, data: Partial<CoachPlanInput>): Promise<CoachPlan> => {
  const res = await authenticatedPut<{ plan: CoachPlan }>(`/coach/plans/${planId}`, data);
  return res.plan;
};

export const deletePlan = async (planId: string): Promise<void> => {
  await authenticatedDelete(`/coach/plans/${planId}`);
};

/** Planes activos de un coach, visibles para cualquier usuario autenticado */
export const getCoachPlans = async (coachId: string): Promise<CoachPlan[]> => {
  const res = await authenticatedGet<{ plans: CoachPlan[] }>(`/coaches/${coachId}/plans`);
  return res.plans ?? [];
};

export const getMyConnections = async (): Promise<any[]> => {
  const res = await authenticatedGet<{ connections: any[] }>('/coaches/my-connections');
  return res.connections ?? [];
};

// ── Historial de entrenamientos del cliente (vista coach) ───────────────────

export interface WorkoutSet {
  set_number: number;
  reps_completed: number | null;
  weight_kg: number | null;
  weight_lbs: number | null;
  rpe_actual: number | null;
  notes: string | null;
  is_warmup: boolean;
}

export interface WorkoutExercise {
  exercise_name: string;
  sets: WorkoutSet[];
}

export interface ClientWorkout {
  id: string;
  workout_date: string;
  completed_at: string;
  duration_minutes: number | null;
  notes: string | null;
  rating: number | null;
  energy_level: number | null;
  exercises: WorkoutExercise[];
}

export interface ClientWorkoutPage {
  workouts: ClientWorkout[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const getClientWorkouts = async (userId: string, page = 1, limit = 10): Promise<ClientWorkoutPage> => {
  const res = await authenticatedGet<ClientWorkoutPage>(`/coach/clients/${userId}/workouts?page=${page}&limit=${limit}`);
  return res;
};
