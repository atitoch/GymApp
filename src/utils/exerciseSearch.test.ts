import { describe, it, expect } from 'vitest';
import { filterExerciseSuggestions } from './exerciseSearch';

const ALL = [
  { name: 'Sentadilla Pendular', sessions: 12 },
  { name: 'Press de Banca Inclinado', sessions: 10 },
  { name: 'Jalón al Pecho', sessions: 8 },
  { name: 'Press Militar con Barra', sessions: 6 },
  { name: 'Sentadilla Búlgara', sessions: 4 },
  { name: 'Curl Bíceps Inclinado', sessions: 3 },
  { name: 'Peso Muerto Rumano', sessions: 2 },
];

describe('filterExerciseSuggestions', () => {
  it('con query vacío devuelve las más frecuentes hasta el máximo', () => {
    const out = filterExerciseSuggestions(ALL, '', 3);
    expect(out.map((s) => s.name)).toEqual([
      'Sentadilla Pendular',
      'Press de Banca Inclinado',
      'Jalón al Pecho',
    ]);
  });

  it('ignora acentos y mayúsculas ("jalon" encuentra "Jalón al Pecho")', () => {
    const out = filterExerciseSuggestions(ALL, 'jalon');
    expect(out.map((s) => s.name)).toEqual(['Jalón al Pecho']);
  });

  it('prioriza coincidencias por prefijo sobre coincidencias internas', () => {
    const out = filterExerciseSuggestions(ALL, 'press');
    expect(out.map((s) => s.name)).toEqual([
      'Press de Banca Inclinado',
      'Press Militar con Barra',
    ]);

    const inclinado = filterExerciseSuggestions(ALL, 'inclinado');
    expect(inclinado.map((s) => s.name)).toEqual([
      'Press de Banca Inclinado',
      'Curl Bíceps Inclinado',
    ]);
  });

  it('ignora espacios sobrantes en la query', () => {
    const out = filterExerciseSuggestions(ALL, '  sentadilla  ');
    expect(out.map((s) => s.name)).toEqual([
      'Sentadilla Pendular',
      'Sentadilla Búlgara',
    ]);
  });

  it('respeta el máximo de resultados', () => {
    const out = filterExerciseSuggestions(ALL, '', 6);
    expect(out).toHaveLength(6);
  });
});
