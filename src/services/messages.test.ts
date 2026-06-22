import { describe, it, expect, vi, beforeEach } from 'vitest';

const { setAuth, subscribe, on, removeChannel } = vi.hoisted(() => ({
  setAuth: vi.fn(),
  subscribe: vi.fn(),
  on: vi.fn(),
  removeChannel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../config/supabase', () => {
  const channelApi = {
    on: (...args: unknown[]) => {
      on(...args);
      return channelApi;
    },
    subscribe: (...args: unknown[]) => {
      subscribe(...args);
      return channelApi;
    },
  };

  return {
    supabaseRealtime: {
      realtime: { setAuth },
      channel: vi.fn(() => channelApi),
      removeChannel,
    },
  };
});

vi.mock('../utils/api', () => ({
  getAuthToken: vi.fn(() => 'initial-token'),
  authenticatedGet: vi.fn(),
  authenticatedPost: vi.fn(),
  authenticatedFetch: vi.fn(),
  authenticatedDelete: vi.fn(),
}));

import { subscribeToMessages } from './messages';
import { emitTokenRefreshed } from '../utils/authEvents';

beforeEach(() => {
  setAuth.mockClear();
});

describe('subscribeToMessages — reautenticación del socket', () => {
  it('autentica el socket con el token actual al suscribirse', () => {
    const unsub = subscribeToMessages('user-1', vi.fn(), vi.fn());

    expect(setAuth).toHaveBeenCalledWith('initial-token');
    unsub();
  });

  it('reautentica el socket cuando se renueva el token mientras el chat está abierto', () => {
    const unsub = subscribeToMessages('user-1', vi.fn(), vi.fn());
    setAuth.mockClear();

    emitTokenRefreshed('refreshed-token');

    expect(setAuth).toHaveBeenCalledWith('refreshed-token');
    unsub();
  });

  it('deja de reautenticar después de hacer unsubscribe (no sigue colgado tras salir del chat)', () => {
    const unsub = subscribeToMessages('user-1', vi.fn(), vi.fn());
    unsub();
    setAuth.mockClear();

    emitTokenRefreshed('refreshed-token');

    expect(setAuth).not.toHaveBeenCalled();
  });

  it('cada suscripción reacciona de forma independiente a un refresh (Header + Chat a la vez)', () => {
    const unsubA = subscribeToMessages('user-1', vi.fn(), vi.fn());
    const unsubB = subscribeToMessages('user-1', vi.fn(), vi.fn());
    setAuth.mockClear();

    emitTokenRefreshed('refreshed-token');

    expect(setAuth).toHaveBeenCalledTimes(2);
    unsubA();
    unsubB();
  });
});
