/**
 * Sistema de colores centralizado
 * Aquí se definen todas las paletas de colores disponibles
 */

import type { ColorPalette, ThemeConfig } from './types';

// Paleta base — Lima eléctrico sobre negro cálido
// Inspirado en Nike Training, WHOOP, F1. Alto contraste, energético, único.
const basePalette: ColorPalette = {
  primary: {
    50:  '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635', // acento principal — lima eléctrico
    500: '#84cc16', // profundidad
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05',
  },

  secondary: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  background: {
    primary:   '#0c0a09', // stone-950 — negro cálido, no azulado
    secondary: '#1c1917', // stone-900
    tertiary:  '#292524', // stone-800
    overlay:   'rgba(28, 25, 23, 0.6)', // stone-900/60
  },

  text: {
    primary:     '#fafaf9', // stone-50 — blanco cálido
    secondary:   '#d6d3d1', // stone-300
    tertiary:    '#a8a29e', // stone-400
    inverse:     '#0c0a09',
    placeholder: '#78716c', // stone-500
  },

  status: {
    success: '#a3e635', // mismo lima — completado
    warning: '#fbbf24', // lime-400
    error:   '#f87171', // red-400
    info:    '#a3e635',
  },

  border: {
    default: '#44403c', // stone-700
    hover:   '#57534e', // stone-600
    focus:   '#a3e635', // lima eléctrico
    error:   '#f87171',
  },

  button: {
    primary: {
      bg:     'linear-gradient(135deg, #a3e635, #84cc16)',
      hover:  'linear-gradient(135deg, #bef264, #a3e635)',
      text:   '#0c0a09', // texto oscuro sobre lima — mejor legibilidad
      shadow: 'rgba(163, 230, 53, 0.25)',
    },
    secondary: {
      bg:     '#292524', // stone-800
      hover:  '#44403c', // stone-700
      text:   '#d6d3d1',
      border: '#44403c',
    },
    ghost: {
      bg:   'transparent',
      hover: '#1c1917',
      text:  '#a3e635',
    },
  },

  input: {
    bg:          'rgba(28, 25, 23, 0.6)',
    border:      '#44403c',
    focus:       '#a3e635',
    placeholder: '#78716c',
    text:        '#fafaf9',
  },

  card: {
    bg:     '#1c1917',
    hover:  '#292524',
    border: '#44403c',
    shadow: 'rgba(163, 230, 53, 0.08)',
  },
};

// Paleta para Coach 1 (ejemplo - puede ser personalizada)
const coach1Palette: ColorPalette = {
  ...basePalette,
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Sky blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
};

// Paleta para Coach 2 (ejemplo - puede ser personalizada)
const coach2Palette: ColorPalette = {
  ...basePalette,
  primary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Fuchsia
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
};

// Paleta para Coach 3 (ejemplo - puede ser personalizada)
const coach3Palette: ColorPalette = {
  ...basePalette,
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
};

// Registro de todas las paletas disponibles
export const themes: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    colors: basePalette,
  },
  coach1: {
    name: 'coach1',
    colors: coach1Palette,
  },
  coach2: {
    name: 'coach2',
    colors: coach2Palette,
  },
  coach3: {
    name: 'coach3',
    colors: coach3Palette,
  },
};

// Paleta por defecto
export const defaultTheme = themes.default;

// Función para obtener una paleta por nombre
export const getTheme = (themeName: string = 'default'): ThemeConfig => {
  return themes[themeName] || themes.default;
};

// Función para obtener una paleta por ID de coach (preparado para futuro)
export const getThemeByCoachId = (coachId: string | null): ThemeConfig => {
  if (!coachId) return themes.default;
  
  // En el futuro, esto podría consultar una API o base de datos
  // Por ahora, mapeamos a paletas predefinidas
  const coachThemeMap: Record<string, string> = {
    'coach-1': 'coach1',
    'coach-2': 'coach2',
    'coach-3': 'coach3',
  };
  
  const themeName = coachThemeMap[coachId] || 'default';
  return getTheme(themeName);
};

