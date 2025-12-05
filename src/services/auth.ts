// URL base del backend (debe configurarse según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import type { ApiResponse } from "../types/api";
import { ApiError } from "../types/api";
import { parseApiError, handleFetchError } from "../utils/errorHandler";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
  refreshToken: string;
}

// Re-exportar ApiError como AuthError para compatibilidad
export type AuthError = ApiError;

/**
 * Inicia sesión con email y contraseña
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const data: ApiResponse<AuthResponse> = await response.json();

    // El backend puede devolver los datos directamente o dentro de data
    if (data.data) {
      return data.data as AuthResponse;
    }

    // Si no hay data, asumir que la respuesta completa es AuthResponse
    return data as unknown as AuthResponse;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Registra un nuevo usuario
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      throw new ApiError("Las contraseñas no coinciden", 400);
    }

    // Dividir fullName en firstName y lastName
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: firstName,
        lastName: lastName,
      }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const authData: ApiResponse<AuthResponse> = await response.json();

    // El backend puede devolver los datos directamente o dentro de data
    if (authData.data) {
      return authData.data as AuthResponse;
    }

    // Si no hay data, asumir que la respuesta completa es AuthResponse
    return authData as unknown as AuthResponse;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Inicia sesión con Google (OAuth)
 */
export const loginWithGoogle = async (): Promise<void> => {
  try {
    // El backend debe manejar la redirección a Google
    // Esto puede variar según cómo implementes OAuth en el backend
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al iniciar sesión con Google");
    }

    // Si el backend devuelve una URL de redirección
    const data = await response.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al iniciar sesión con Google");
  }
};

/**
 * Inicia sesión con GitHub (OAuth)
 */
export const loginWithGitHub = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/github`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al iniciar sesión con GitHub");
    }

    const data = await response.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al iniciar sesión con GitHub");
  }
};

/**
 * Cierra sesión
 */
export const logout = async (
  token: string,
  refreshToken?: string
): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    });
  } catch (error) {
    // Incluso si falla, limpiamos el token localmente
    console.error("Error al cerrar sesión en el servidor:", error);
  }
};

/**
 * Refresca el token de acceso
 */
export const refreshToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await parseApiError(response);
      // 400 significa que el refresh token es inválido/expirado (comportamiento esperado)
      // No necesitamos loguearlo como error, solo lanzarlo para que el contexto lo maneje
      throw error;
    }

    const data: ApiResponse<AuthResponse> = await response.json();

    // El backend puede devolver los datos directamente o dentro de data
    if (data.data) {
      return data.data as AuthResponse;
    }

    // Si no hay data, asumir que la respuesta completa es AuthResponse
    return data as unknown as AuthResponse;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Verifica si un token es válido y obtiene información del usuario
 */
export const verifyToken = async (
  token: string
): Promise<{ valid: boolean; user?: { id: string; email: string } }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return data;
  } catch {
    return { valid: false };
  }
};

/**
 * Solicita restablecimiento de contraseña
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Reenvía el correo de verificación
 */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }
  } catch (error) {
    throw handleFetchError(error);
  }
};
