// URL base del backend (debe configurarse según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL;

import type { ApiResponse } from '../types/api';
import { parseApiError, handleFetchError } from './errorHandler';

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Respuesta inesperada del servidor (${response.status})`);
  }
  return response.json();
};

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

/**
 * Limpia la sesión y redirige al login
 */
const handleUnauthorized = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
  window.location.href = '/';
};

let _isRefreshing = false;
let _refreshPromise: Promise<string | null> | null = null;

/**
 * Intenta renovar el token con el refresh token.
 * Si ya hay un refresh en curso, espera el mismo para evitar llamadas duplicadas.
 */
const tryRefreshToken = (): Promise<string | null> => {
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  _isRefreshing = true;
  _refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const newToken: string = data?.data?.token ?? data?.token;
      if (!newToken) return null;

      localStorage.setItem(TOKEN_KEY, newToken);
      if (data?.data?.refreshToken ?? data?.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data?.data?.refreshToken ?? data?.refreshToken);
      }
      return newToken;
    } catch {
      return null;
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
};

/**
 * Obtiene el token de autenticación del localStorage
 * Asegura que siempre se lea el valor más reciente
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
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
    'Content-Type': 'application/json',
  };

  // Siempre incluir el token si está disponible
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Realiza una petición autenticada al backend
 * Incluye automáticamente el token en el header Authorization
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  // Normalizar el endpoint (quitar barra inicial si existe)
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}/${normalizedEndpoint}`;

  // Obtener headers con autenticación
  const authHeaders = createAuthHeaders();

  // Merge headers personalizados con los de autenticación
  // Los headers personalizados tienen prioridad para permitir sobrescribir si es necesario
  const mergedHeaders = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  let response = await fetch(url, { ...options, headers: mergedHeaders });

  // En 401 intentar renovar el token una sola vez y reintentar
  if (response.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryHeaders = {
        ...mergedHeaders,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return response;
};

/**
 * Realiza una petición GET autenticada
 */
export const authenticatedGet = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      throw await parseApiError(response);
    }

    const data: ApiResponse<T> = await parseJsonResponse(response);

    if (data.data !== undefined) return data.data;
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
  data?: unknown,
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await parseJsonResponse(response);

    if (responseData.data !== undefined) return responseData.data;
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
  data?: unknown,
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await parseJsonResponse(response);

    if (responseData.data !== undefined) return responseData.data;
    return responseData as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * Realiza una petición PATCH autenticada
 */
export const authenticatedPatch = async <T>(
  endpoint: string,
  data?: unknown,
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await parseJsonResponse(response);

    if (responseData.data !== undefined) return responseData.data;
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
      method: 'DELETE',
    });

    if (!response.ok) {
      // Si es un 401, limpiar sesión y redirigir al login
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sesión expirada. Redirigiendo al login...');
      }
      throw await parseApiError(response);
    }

    const responseData: ApiResponse<T> = await parseJsonResponse(response);

    if (responseData.data !== undefined) return responseData.data;
    return responseData as unknown as T;
  } catch (error) {
    throw handleFetchError(error);
  }
};
