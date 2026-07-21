import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiError, ErrorType, HttpStatus } from '../types/api';
import {
  enqueueSet,
  getQueuedSets,
  toOptimisticLog,
  flushQueue,
  clearQueue,
} from './syncQueue';
import type { CreateExerciseSetRequest, ExerciseLog } from '../types/workoutLog';

const payload: CreateExerciseSetRequest = {
  exercise_name: 'Sentadilla',
  set_number: 1,
  reps_completed: 8,
  weight_kg: 80,
};

function networkError() {
  return new ApiError(
    'Failed to fetch',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorType.SERVER,
    undefined,
    new TypeError('Failed to fetch'),
  );
}

function serverError() {
  return new ApiError(
    'Workout log no encontrado',
    HttpStatus.NOT_FOUND,
    ErrorType.NOT_FOUND,
    undefined,
    { success: false, error: 'Workout log no encontrado' },
  );
}

function fakeLog(overrides: Partial<ExerciseLog> = {}): ExerciseLog {
  return {
    id: 'real-id-1',
    workout_log_id: 'wl-1',
    exercise_name: payload.exercise_name,
    set_number: payload.set_number,
    reps_completed: payload.reps_completed ?? null,
    weight_kg: payload.weight_kg ?? null,
    ...overrides,
  } as ExerciseLog;
}

beforeEach(() => {
  localStorage.clear();
});

describe('enqueueSet / getQueuedSets', () => {
  it('persiste el set encolado en localStorage con un tempId único', () => {
    const item = enqueueSet('wl-1', payload);

    expect(item.tempId).toMatch(/^temp_/);
    expect(getQueuedSets()).toHaveLength(1);
    expect(getQueuedSets()[0]).toMatchObject({ workoutLogId: 'wl-1', payload });
  });

  it('sobrevive a una "recarga" (releer desde localStorage, sin estado en memoria)', () => {
    enqueueSet('wl-1', payload);
    enqueueSet('wl-1', { ...payload, set_number: 2 });

    // getQueuedSets no depende de ninguna referencia previa: simula
    // releer la cola tras un refresh de la app.
    expect(getQueuedSets()).toHaveLength(2);
  });
});

describe('toOptimisticLog', () => {
  it('genera un ExerciseLog visible en la UI antes de sincronizar', () => {
    const item = enqueueSet('wl-1', payload);
    const optimistic = toOptimisticLog(item);

    expect(optimistic.id).toBe(item.tempId);
    expect(optimistic.exercise_name).toBe(payload.exercise_name);
    expect(optimistic.weight_kg).toBe(80);
  });
});

describe('flushQueue', () => {
  it('sincroniza todos los sets pendientes y vacía la cola si todo sale bien', async () => {
    enqueueSet('wl-1', payload);
    enqueueSet('wl-1', { ...payload, set_number: 2 });

    const syncFn = vi.fn().mockResolvedValue(fakeLog());
    const { synced, dropped } = await flushQueue(syncFn);

    expect(synced).toHaveLength(2);
    expect(dropped).toHaveLength(0);
    expect(syncFn).toHaveBeenCalledTimes(2);
    expect(getQueuedSets()).toHaveLength(0);
  });

  it('mantiene en la cola los sets que siguen fallando por red (no los pierde)', async () => {
    enqueueSet('wl-1', payload);

    const syncFn = vi.fn().mockRejectedValue(networkError());
    const { synced, dropped } = await flushQueue(syncFn);

    expect(synced).toHaveLength(0);
    expect(dropped).toHaveLength(0);
    // Sigue offline: el set queda en la cola para el próximo intento.
    expect(getQueuedSets()).toHaveLength(1);
  });

  it('descarta un set si el backend lo rechaza por algo que no es de red', async () => {
    enqueueSet('wl-1', payload);

    const syncFn = vi.fn().mockRejectedValue(serverError());
    const { synced, dropped } = await flushQueue(syncFn);

    expect(synced).toHaveLength(0);
    expect(dropped).toHaveLength(1);
    // Reintentar un 404 de "workout log no encontrado" nunca funcionaría.
    expect(getQueuedSets()).toHaveLength(0);
  });

  it('sincroniza lo que puede y deja en cola solo lo que sigue fallando por red', async () => {
    const itemA = enqueueSet('wl-1', payload);
    enqueueSet('wl-1', { ...payload, set_number: 2 });

    const syncFn = vi
      .fn()
      .mockResolvedValueOnce(fakeLog({ id: 'real-1' }))
      .mockRejectedValueOnce(networkError());

    const { synced, dropped } = await flushQueue(syncFn);

    expect(synced).toEqual([{ tempId: itemA.tempId, log: fakeLog({ id: 'real-1' }) }]);
    expect(dropped).toHaveLength(0);
    expect(getQueuedSets()).toHaveLength(1);
    expect(getQueuedSets()[0].payload.set_number).toBe(2);
  });

  it('no hace nada si la cola está vacía', async () => {
    const syncFn = vi.fn();
    const { synced, dropped } = await flushQueue(syncFn);

    expect(synced).toHaveLength(0);
    expect(dropped).toHaveLength(0);
    expect(syncFn).not.toHaveBeenCalled();
  });

  it('dos flushes concurrentes no duplican los sets (guard de reentrada)', async () => {
    enqueueSet('wl-1', { ...payload, set_number: 1 });
    enqueueSet('wl-1', { ...payload, set_number: 2 });

    // syncFn lento para que el segundo flush llegue mientras el primero corre
    const syncFn = vi.fn().mockImplementation(
      async (_id, p: CreateExerciseSetRequest) =>
        new Promise((resolve) =>
          setTimeout(() => resolve(fakeLog({ set_number: p.set_number })), 10),
        ),
    );

    const [first, second] = await Promise.all([
      flushQueue(syncFn),
      flushQueue(syncFn),
    ]);

    // Solo un flush procesa la cola; el otro sale sin hacer nada
    expect(syncFn).toHaveBeenCalledTimes(2);
    expect(first.synced.length + second.synced.length).toBe(2);
  });

  it('respeta el orden de creación al sincronizar (FIFO)', async () => {
    enqueueSet('wl-1', { ...payload, set_number: 1 });
    enqueueSet('wl-1', { ...payload, set_number: 2 });
    enqueueSet('wl-1', { ...payload, set_number: 3 });

    const calledOrder: number[] = [];
    const syncFn = vi.fn().mockImplementation(async (_id, p: CreateExerciseSetRequest) => {
      calledOrder.push(p.set_number);
      return fakeLog({ set_number: p.set_number });
    });

    await flushQueue(syncFn);

    expect(calledOrder).toEqual([1, 2, 3]);
  });
});

describe('clearQueue', () => {
  it('vacía la cola manualmente', () => {
    enqueueSet('wl-1', payload);
    clearQueue();
    expect(getQueuedSets()).toHaveLength(0);
  });
});
