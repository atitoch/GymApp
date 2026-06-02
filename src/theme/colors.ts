/**
 * Sistema de colores centralizado
 * Aquí se definen todas las paletas de colores disponibles
 */

import type { ColorPalette, ThemeConfig } from './types';

// Paleta base (por defecto)
const basePalette: ColorPalette = {
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Amber principal
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Green secundario
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  background: {
    primary: '#020617', // slate-950
    secondary: '#0f172a', // slate-900
    tertiary: '#1e293b', // slate-800
    overlay: 'rgba(15, 23, 42, 0.5)', // slate-900/50
  },
  
  text: {
    primary: '#f8fafc', // slate-50
    secondary: '#cbd5e1', // slate-300
    tertiary: '#94a3b8', // slate-400
    inverse: '#0f172a', // slate-900
    placeholder: '#64748b', // slate-500
  },
  
  status: {
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#f59e0b', // amber-500
  },
  
  border: {
    default: '#334155', // slate-700
    hover: '#475569', // slate-600
    focus: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
  },
  
  button: {
    primary: {
      bg: 'linear-gradient(to right, #f59e0b, #d97706)', // from-amber-500 to-amber-600
      hover: 'linear-gradient(to right, #d97706, #b45309)', // from-amber-600 to-amber-700
      text: '#ffffff',
      shadow: 'rgba(245, 158, 11, 0.3)', // amber-500/30
    },
    secondary: {
      bg: '#1e293b', // slate-800
      hover: '#334155', // slate-700
      text: '#cbd5e1', // slate-300
      border: '#334155', // slate-700
    },
    ghost: {
      bg: 'transparent',
      hover: '#1e293b', // slate-800
      text: '#f59e0b', // amber-400
    },
  },
  
  input: {
    bg: 'rgba(15, 23, 42, 0.5)', // slate-900/50
    border: '#334155', // slate-700
    focus: '#f59e0b', // amber-500
    placeholder: '#64748b', // slate-500
    text: '#f8fafc', // slate-50
  },
  
  card: {
    bg: '#1e293b', // slate-800
    hover: '#334155', // slate-700
    border: '#334155', // slate-700
    shadow: 'rgba(245, 158, 11, 0.15)', // amber-500/20
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

