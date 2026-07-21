import { describe, it, expect } from 'vitest';
import { convertWeight, getSetWeightInUnit, isStoredInOtherUnit } from './weight';

describe('getSetWeightInUnit', () => {
  it('devuelve el campo directo cuando existe en la unidad pedida', () => {
    expect(getSetWeightInUnit({ weight_kg: 60, weight_lbs: null }, 'kg')).toBe(60);
    expect(getSetWeightInUnit({ weight_kg: null, weight_lbs: 135 }, 'lbs')).toBe(135);
  });

  it('convierte desde la otra unidad cuando falta el campo directo', () => {
    // 100 kg → 220.5 lbs; 135 lbs → 61.2 kg (redondeado a 1 decimal)
    expect(getSetWeightInUnit({ weight_kg: 100, weight_lbs: null }, 'lbs')).toBe(220.5);
    expect(getSetWeightInUnit({ weight_kg: null, weight_lbs: 135 }, 'kg')).toBe(61.2);
  });

  it('coerciona strings del API a número (numeric llega como "140.00")', () => {
    const set = { weight_kg: null, weight_lbs: '140.00' as unknown as number };
    const w = getSetWeightInUnit(set, 'lbs');
    expect(w).toBe(140);
    // sin coerción, "90.00" > "140.00" sería true por comparación lexicográfica
    const w2 = getSetWeightInUnit({ weight_kg: null, weight_lbs: '90.00' as unknown as number }, 'lbs');
    expect(w2 > w).toBe(false);
  });

  it('devuelve 0 si el set no tiene peso en ninguna unidad', () => {
    expect(getSetWeightInUnit({ weight_kg: null, weight_lbs: null }, 'kg')).toBe(0);
  });
});

describe('isStoredInOtherUnit', () => {
  it('detecta sets guardados en la unidad contraria', () => {
    expect(isStoredInOtherUnit({ weight_kg: 60, weight_lbs: null }, 'lbs')).toBe(true);
    expect(isStoredInOtherUnit({ weight_kg: null, weight_lbs: 135 }, 'lbs')).toBe(false);
    expect(isStoredInOtherUnit({ weight_kg: null, weight_lbs: null }, 'lbs')).toBe(false);
  });
});

describe('convertWeight', () => {
  it('es simétrica', () => {
    const lbs = convertWeight(100, 'kg', 'lbs');
    expect(convertWeight(lbs, 'lbs', 'kg')).toBeCloseTo(100, 6);
  });
});
