import type { ApiResponse } from "../types/api";
import { ApiError, HttpStatus, ErrorType } from "../types/api";

/**
 * Parsea una respuesta de error del backend y crea un ApiError
 */
export const parseApiError = async (
  response: Response
): Promise<ApiError> => {
  let apiResponse: ApiResponse;

  try {
    apiResponse = await response.json();
  } catch {
    // Si no se puede parsear el JSON, crear un error genérico
    return new ApiError(
      `Error ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  // Extraer el mensaje de error
  const errorMessage =
    apiResponse.error ||
    apiResponse.message ||
    `Error ${response.status}: ${response.statusText}`;

  // Determinar el tipo de error basándose en el status code si no está en meta
  let errorType = apiResponse.meta?.errorType;
  if (!errorType) {
    switch (response.status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        errorType = ErrorType.VALIDATION;
        break;
      case HttpStatus.UNAUTHORIZED:
        errorType = ErrorType.AUTHENTICATION;
        break;
      case HttpStatus.FORBIDDEN:
        errorType = ErrorType.AUTHORIZATION;
        break;
      case HttpStatus.NOT_FOUND:
        errorType = ErrorType.NOT_FOUND;
        break;
      case HttpStatus.CONFLICT:
        errorType = ErrorType.CONFLICT;
        break;
      default:
        errorType = ErrorType.SERVER;
    }
  }

  // Extraer errores de validación por campo si existen
  // El backend puede devolverlos en diferentes formatos:
  // 1. En el campo 'errors' del ApiResponse
  // 2. En el campo 'data' si es un objeto con campos
  // 3. En el mensaje de error si está estructurado
  let fieldErrors: Record<string, string | string[]> | undefined;

  if (apiResponse.errors) {
    fieldErrors = apiResponse.errors;
  } else if (apiResponse.data && typeof apiResponse.data === "object") {
    // Intentar extraer errores del objeto data
    const data = apiResponse.data as any;
    if (data.errors && typeof data.errors === "object") {
      fieldErrors = data.errors;
    }
  }

  return new ApiError(
    errorMessage,
    response.status,
    errorType,
    fieldErrors,
    apiResponse
  );
};

/**
 * Maneja errores de fetch y los convierte en ApiError
 */
export const handleFetchError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorType.SERVER,
      undefined,
      error
    );
  }

  return new ApiError(
    "Error desconocido",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorType.SERVER,
    undefined,
    error
  );
};

/**
 * Distingue una falla de red/conectividad (fetch nunca llegó al servidor)
 * de un error real devuelto por el backend. parseApiError siempre envuelve
 * la respuesta del servidor con originalError = el body ya parseado (un
 * objeto plano o undefined); en cambio, cuando fetch lanza (sin conexión,
 * DNS, etc.) handleFetchError guarda el Error nativo como originalError.
 * Esa es la señal para decidir si algo debe encolarse para reintentar en
 * vez de mostrarse como error definitivo.
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof ApiError && error.originalError instanceof Error;
};

/**
 * Normaliza errores de validación por campo
 * Convierte arrays de errores en strings simples
 */
export const normalizeFieldErrors = (
  errors: Record<string, string | string[]> | undefined
): Record<string, string> | undefined => {
  if (!errors) return undefined;

  const normalized: Record<string, string> = {};

  for (const [field, error] of Object.entries(errors)) {
    if (Array.isArray(error)) {
      normalized[field] = error[0] || error.join(", ");
    } else {
      normalized[field] = error;
    }
  }

  return normalized;
};

