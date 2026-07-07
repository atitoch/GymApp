const KG_TO_LBS = 2.2046226218;

export type WeightUnit = 'kg' | 'lbs';

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === 'kg' ? value * KG_TO_LBS : value / KG_TO_LBS;
}

/**
 * Peso de un set en la unidad pedida. Cada set solo guarda el campo de la
 * unidad activa al momento de registrarlo (weight_kg o weight_lbs, nunca
 * ambos), así que si el usuario cambió su unidad de peso preferida después,
 * hay que convertir el otro campo en vez de tratarlo como ausente/0.
 */
export function getSetWeightInUnit(
  set: { weight_kg?: number | null; weight_lbs?: number | null },
  unit: WeightUnit,
): number {
  const direct = unit === 'lbs' ? set.weight_lbs : set.weight_kg;
  if (direct != null) return direct;

  const other = unit === 'lbs' ? set.weight_kg : set.weight_lbs;
  if (other != null) {
    const otherUnit: WeightUnit = unit === 'lbs' ? 'kg' : 'lbs';
    return Math.round(convertWeight(other, otherUnit, unit) * 10) / 10;
  }

  return 0;
}
