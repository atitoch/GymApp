// URL base del backend (debe configurarse según el entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import type { ApiResponse } from "../types/api";
import { parseApiError, handleFetchError } from "./errorHandler";

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Crea headers con autenticación
 */
export const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Realiza una petición autenticada al backend
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers = createAuthHeaders();

  // Merge headers personalizados con los de autenticación
  const mergedHeaders = {
    ...headers,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  // Si el token expiró (401), podrías intentar refrescarlo aquí
  if (response.status === 401) {
    // El contexto de autenticación manejará el refresh
    throw new Error("Token expirado o inválido");
  }

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
