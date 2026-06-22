import { describe, it, expect, vi, afterEach } from 'vitest';
import { onTokenRefreshed, emitTokenRefreshed } from './authEvents';

describe('authEvents', () => {
  const cleanups: Array<() => void> = [];
  afterEach(() => {
    cleanups.splice(0).forEach((unsub) => unsub());
  });

  it('notifica a un listener cuando se emite un token nuevo', () => {
    const listener = vi.fn();
    cleanups.push(onTokenRefreshed(listener));

    emitTokenRefreshed('new-token');

    expect(listener).toHaveBeenCalledWith('new-token');
  });

  it('notifica a todos los listeners suscritos', () => {
    const a = vi.fn();
    const b = vi.fn();
    cleanups.push(onTokenRefreshed(a));
    cleanups.push(onTokenRefreshed(b));

    emitTokenRefreshed('new-token');

    expect(a).toHaveBeenCalledWith('new-token');
    expect(b).toHaveBeenCalledWith('new-token');
  });

  it('deja de notificar a un listener después de desuscribirse', () => {
    const listener = vi.fn();
    const unsubscribe = onTokenRefreshed(listener);

    unsubscribe();
    emitTokenRefreshed('new-token');

    expect(listener).not.toHaveBeenCalled();
  });

  it('no afecta a otros listeners al desuscribir uno', () => {
    const a = vi.fn();
    const b = vi.fn();
    const unsubscribeA = onTokenRefreshed(a);
    onTokenRefreshed(b);

    unsubscribeA();
    emitTokenRefreshed('new-token');

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith('new-token');
  });
});
