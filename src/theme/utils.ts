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
  bgPrimary: "bg-stone-950",
  bgSecondary: "bg-stone-900",
  bgTertiary: "bg-stone-800",
  bgOverlay: "bg-stone-900/50",

  // Text
  textPrimary: "text-stone-50",
  textSecondary: "text-stone-300",
  textTertiary: "text-stone-400",
  textPlaceholder: "text-stone-500",
  textInverse: "text-stone-900",

  // Primary colors
  primary50: "text-lime-50",
  primary100: "text-lime-100",
  primary200: "text-lime-200",
  primary300: "text-lime-300",
  primary400: "text-lime-400",
  primary500: "text-lime-400",
  primary600: "text-lime-500",
  primary700: "text-lime-600",
  primary800: "text-lime-800",
  primary900: "text-lime-900",

  bgPrimary50: "bg-lime-50",
  bgPrimary100: "bg-lime-100",
  bgPrimary200: "bg-lime-200",
  bgPrimary300: "bg-lime-300",
  bgPrimary400: "bg-lime-400",
  bgPrimary500: "bg-lime-400",
  bgPrimary600: "bg-lime-500",
  bgPrimary700: "bg-lime-600",
  bgPrimary800: "bg-lime-800",
  bgPrimary900: "bg-lime-900",

  // Secondary colors
  secondary500: "text-green-500",
  bgSecondary500: "bg-green-500",

  // Borders
  borderDefault: "border-stone-700",
  borderHover: "border-stone-600",
  borderFocus: "border-lime-400",
  borderError: "border-red-500",

  // Status
  success: "text-green-500",
  warning: "text-lime-400",
  error: "text-red-500",
  info: "text-lime-400",

  bgSuccess: "bg-green-500/10",
  bgWarning: "bg-lime-400/10",
  bgError: "bg-red-500/10",
  bgInfo: "bg-lime-400/10",

  borderSuccess: "border-green-500/50",
  borderWarning: "border-lime-400/50",
  borderErrorOpacity: "border-red-500/50",
  borderInfo: "border-lime-400/50",
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
