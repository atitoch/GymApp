import { authenticatedGet, authenticatedPut, authenticatedPost } from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  bio?: string | null;
  avatar_url?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  gender?: string | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
  weight_unit: 'kg' | 'lbs';
  default_rest_seconds: number;
  notify_rest_timer: boolean;
  notify_workout_reminder: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  height_cm?: number;
  weight_kg?: number;
  gender?: string;
  fitness_goal?: string;
  activity_level?: string;
  weight_unit?: 'kg' | 'lbs';
  default_rest_seconds?: number;
  notify_rest_timer?: boolean;
  notify_workout_reminder?: boolean;
  reminder_time?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Obtener perfil del usuario
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    return await authenticatedGet<UserProfile>(`/users/profile`);
  } catch {
    return null;
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateUserProfile = async (
  data: UpdateProfileData,
): Promise<UserProfile> => {
  return await authenticatedPut<UserProfile>(`/users/profile`, data);
};

export const getAvatarUploadUrl = async (file: File): Promise<{ upload_url: string; public_url: string }> => {
  return authenticatedPost(`/users/avatar/upload-url`, {
    file_name: file.name,
    content_type: file.type,
  });
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const { upload_url, public_url } = await getAvatarUploadUrl(file);
  await fetch(upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  return public_url;
};
