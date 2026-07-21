export interface ExerciseSuggestion {
  name: string;
  sessions: number;
}

const normalize = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Filtra sugerencias de ejercicios mientras el usuario escribe, ignorando
 * mayúsculas, acentos y espacios sobrantes ("jalon" encuentra "Jalón al
 * Pecho"). Con query vacío devuelve las primeras `max` (la lista ya viene
 * ordenada por frecuencia desde el backend); con texto, las coincidencias
 * por prefijo van antes que las coincidencias en medio del nombre.
 */
export function filterExerciseSuggestions<T extends ExerciseSuggestion>(
  all: T[],
  query: string,
  max = 6,
): T[] {
  const q = normalize(query);
  if (!q) return all.slice(0, max);

  const starts: T[] = [];
  const contains: T[] = [];
  for (const s of all) {
    const n = normalize(s.name);
    if (n.startsWith(q)) starts.push(s);
    else if (n.includes(q)) contains.push(s);
  }
  return [...starts, ...contains].slice(0, max);
}
