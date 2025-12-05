/**
 * Tipos para respuestas HTTP estandarizadas del backend
 * Estos tipos coinciden con la estructura definida en el backend (httpResponse.ts)
 */

/**
 * Códigos de estado HTTP comunes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Tipos de errores comunes
 */
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  CONFLICT = "CONFLICT_ERROR",
  SERVER = "SERVER_ERROR",
}

/**
 * Estructura de respuesta estándar del backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    path?: string;
    errorType?: ErrorType | string;
  };
  // Errores de validación por campo (opcional, depende de cómo el backend los devuelva)
  errors?: Record<string, string | string[]>;
}

/**
 * Error personalizado para errores de la API
 */
export class ApiError extends Error {
  public statusCode: number;
  public errorType?: ErrorType | string;
  public fieldErrors?: Record<string, string | string[]>;
  public originalError?: any;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errorType?: ErrorType | string,
    fieldErrors?: Record<string, string | string[]>,
    originalError?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.fieldErrors = fieldErrors;
    this.originalError = originalError;
  }

  /**
   * Verifica si el error es de validación
   */
  isValidationError(): boolean {
    return (
      this.errorType === ErrorType.VALIDATION ||
      this.statusCode === HttpStatus.BAD_REQUEST ||
      this.statusCode === HttpStatus.UNPROCESSABLE_ENTITY ||
      !!this.fieldErrors
    );
  }

  /**
   * Verifica si el error es de autenticación
   */
  isAuthenticationError(): boolean {
    return (
      this.errorType === ErrorType.AUTHENTICATION ||
      this.statusCode === HttpStatus.UNAUTHORIZED
    );
  }

  /**
   * Verifica si el error es de autorización
   */
  isAuthorizationError(): boolean {
    return (
      this.errorType === ErrorType.AUTHORIZATION ||
      this.statusCode === HttpStatus.FORBIDDEN
    );
  }
}

