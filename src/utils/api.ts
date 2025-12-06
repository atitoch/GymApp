// URL base del backend (debe configurarse según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import type { ApiResponse } from "../types/api";
import { parseApiError, handleFetchError } from "./errorHandler";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

/**
 * Limpia la sesión y redirige al login
 * Se llama cuando el token expira (401)
 */
const handleUnauthorized = () => {
  // Limpiar localStorage
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    // Ignorar errores al limpiar localStorage
  }
  
  // Redirigir al login
  // Usamos window.location.href para forzar una recarga completa
  // Esto asegura que React Router se reinicialice correctamente
  window.location.href = "/login";
};

/**
 * Obtiene el token de autenticación del localStorage
 * Asegura que siempre se lea el valor más reciente
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

/**
 * Crea headers con autenticación
 * Siempre incluye el token si está disponible
 */
export const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Siempre incluir el token si está disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Realiza una petición autenticada al backend
 * Incluye automáticamente el token en el header Authorization
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // Obtener headers con autenticación
  const authHeaders = createAuthHeaders();

  // Merge headers personalizados con los de autenticación
  // Los headers personalizados tienen prioridad para permitir sobrescribir si es necesario
  const mergedHeaders = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  // Si el token expiró (401), no lanzar error aquí
  // Dejamos que el código que llama maneje el 401
  // para que pueda intentar refrescar el token si es necesario
  return response;
};

/**
 * Realiza una petición GET autenticada
 */
export const authenticatedGet = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Sesión expirada. Redirigiendo al login...");
      }
      throw await parseApiError(response);
    }

    const data: ApiResponse<T> = await response.json();
    
    // El backend puede devolver los datos directamente o dentro de data
    if (data.data !== undefined) {
      return data.data;
    }
    
    // Si no hay data, asumir que la respuesta completa es T
    return data as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Realiza una petición POST autenticada
 */
export const authenticatedPost = async <T>(
  endpoint: string,
  data?: unknown
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Sesión expirada. Redirigiendo al login...");
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await response.json();
    
    // El backend puede devolver los datos directamente o dentro de data
    if (responseData.data !== undefined) {
      return responseData.data;
    }
    
    // Si no hay data, asumir que la respuesta completa es T
    return responseData as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Realiza una petición PUT autenticada
 */
export const authenticatedPut = async <T>(
  endpoint: string,
  data?: unknown
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Sesión expirada. Redirigiendo al login...");
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await response.json();
    
    // El backend puede devolver los datos directamente o dentro de data
    if (responseData.data !== undefined) {
      return responseData.data;
    }
    
    // Si no hay data, asumir que la respuesta completa es T
    return responseData as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Realiza una petición DELETE autenticada
 */
export const authenticatedDelete = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Sesión expirada. Redirigiendo al login...");
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await response.json();
    
    // El backend puede devolver los datos directamente o dentro de data
    if (responseData.data !== undefined) {
      return responseData.data;
    }
    
    // Si no hay data, asumir que la respuesta completa es T
    return responseData as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};
