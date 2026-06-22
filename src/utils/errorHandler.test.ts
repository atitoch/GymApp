import { describe, it, expect } from 'vitest';
import { ApiError, ErrorType, HttpStatus } from '../types/api';
import { handleFetchError, isNetworkError } from './errorHandler';

describe('isNetworkError', () => {
  it('detecta una falla de fetch (sin conexión) como error de red', () => {
    // Así llega un fetch que nunca llegó al servidor: TypeError nativo
    // envuelto por handleFetchError.
    const networkFailure = handleFetchError(new TypeError('Failed to fetch'));
    expect(isNetworkError(networkFailure)).toBe(true);
  });

  it('no marca como error de red una respuesta real del backend', () => {
    // Así queda un ApiError construido por parseApiError: originalError es
    // el body ya parseado (un objeto plano), no un Error nativo.
    const backendError = new ApiError(
      'Datos inválidos',
      HttpStatus.BAD_REQUEST,
      ErrorType.VALIDATION,
      undefined,
      { success: false, error: 'Datos inválidos' },
    );
    expect(isNetworkError(backendError)).toBe(false);
  });

  it('no marca como error de red un ApiError sin originalError', () => {
    const genericError = new ApiError('Error 500: Internal Server Error', 500);
    expect(isNetworkError(genericError)).toBe(false);
  });

  it('no marca como error de red algo que no es un ApiError', () => {
    expect(isNetworkError(new Error('cualquier cosa'))).toBe(false);
    expect(isNetworkError('string error')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
