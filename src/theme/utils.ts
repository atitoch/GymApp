/**
 * Utilidades para trabajar con el sistema de colores
 */

import type { ColorPalette } from "./types";

/**
 * Mapeo de colores del tema a clases de Tailwind
 * Esto permite usar los colores del tema de manera consistente
 */
export const themeToTailwind = {
  // Backgrounds
  bgPrimary: "bg-slate-950",
  bgSecondary: "bg-slate-900",
  bgTertiary: "bg-slate-800",
  bgOverlay: "bg-slate-900/50",

  // Text
  textPrimary: "text-slate-50",
  textSecondary: "text-slate-300",
  textTertiary: "text-slate-400",
  textPlaceholder: "text-slate-500",
  textInverse: "text-slate-900",

  // Primary colors
  primary50: "text-blue-50",
  primary100: "text-blue-100",
  primary200: "text-blue-200",
  primary300: "text-blue-300",
  primary400: "text-blue-400",
  primary500: "text-blue-500",
  primary600: "text-blue-600",
  primary700: "text-blue-700",
  primary800: "text-blue-800",
  primary900: "text-blue-900",

  bgPrimary50: "bg-blue-50",
  bgPrimary100: "bg-blue-100",
  bgPrimary200: "bg-blue-200",
  bgPrimary300: "bg-blue-300",
  bgPrimary400: "bg-blue-400",
  bgPrimary500: "bg-blue-500",
  bgPrimary600: "bg-blue-600",
  bgPrimary700: "bg-blue-700",
  bgPrimary800: "bg-blue-800",
  bgPrimary900: "bg-blue-900",

  // Secondary colors
  secondary500: "text-green-500",
  bgSecondary500: "bg-green-500",

  // Borders
  borderDefault: "border-slate-700",
  borderHover: "border-slate-600",
  borderFocus: "border-blue-500",
  borderError: "border-red-500",

  // Status
  success: "text-green-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-blue-500",

  bgSuccess: "bg-green-500/10",
  bgWarning: "bg-amber-500/10",
  bgError: "bg-red-500/10",
  bgInfo: "bg-blue-500/10",

  borderSuccess: "border-green-500/50",
  borderWarning: "border-amber-500/50",
  borderErrorOpacity: "border-red-500/50",
  borderInfo: "border-blue-500/50",
};

/**
 * Obtiene el valor hexadecimal de un color del tema
 */
export const getColorValue = (palette: ColorPalette, path: string): string => {
  const keys = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = palette;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return "";
  }

  return typeof value === "string" ? value : "";
};

/**
 * Convierte un color hexadecimal a RGB
 */
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convierte RGB a rgba con opacidad
 */
export const rgbToRgba = (
  rgb: { r: number; g: number; b: number },
  opacity: number
): string => {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Obtiene un color con opacidad
 */
export const getColorWithOpacity = (
  palette: ColorPalette,
  path: string,
  opacity: number
): string => {
  const hex = getColorValue(palette, path);
  if (!hex) return "";

  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToRgba(rgb, opacity);
};
