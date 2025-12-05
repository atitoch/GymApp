/**
 * Hooks personalizados para trabajar con el sistema de colores
 */

import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { ColorPalette, ThemeContextValue } from "./types";

/**
 * Hook para acceder al contexto del tema
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
};

/**
 * Hook para acceder a los colores del tema actual
 */
export const useColors = (): ColorPalette => {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
};

/**
 * Hook para obtener clases de Tailwind basadas en el tema
 * Retorna un objeto con clases predefinidas para componentes comunes
 */
export const useThemeClasses = () => {
  return {
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

    // Borders
    borderDefault: "border-slate-700",
    borderHover: "border-slate-600",
    borderFocus: "border-blue-500",

    // Buttons
    btnPrimary:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    btnSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-300",
    btnGhost: "bg-transparent hover:bg-slate-800 text-blue-400",

    // Cards
    card: "bg-slate-800 hover:bg-slate-700 border border-slate-700",

    // Inputs
    input:
      "bg-slate-900/50 border border-slate-700 focus:border-blue-500 text-slate-50 placeholder-slate-500",

    // Status colors
    success: "text-green-500 bg-green-500/10 border-green-500/50",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/50",
    error: "text-red-500 bg-red-500/10 border-red-500/50",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/50",
  };
};

/**
 * Hook para obtener estilos inline basados en el tema
 */
export const useThemeStyles = () => {
  const colors = useColors();

  return {
    // Backgrounds
    bgPrimary: { backgroundColor: colors.background.primary },
    bgSecondary: { backgroundColor: colors.background.secondary },
    bgTertiary: { backgroundColor: colors.background.tertiary },
    bgOverlay: { backgroundColor: colors.background.overlay },

    // Text
    textPrimary: { color: colors.text.primary },
    textSecondary: { color: colors.text.secondary },
    textTertiary: { color: colors.text.tertiary },

    // Buttons
    buttonPrimary: {
      background: colors.button.primary.bg,
      color: colors.button.primary.text,
      boxShadow: `0 10px 15px -3px ${colors.button.primary.shadow}`,
    },
    buttonPrimaryHover: {
      background: colors.button.primary.hover,
    },

    // Inputs
    input: {
      backgroundColor: colors.input.bg,
      borderColor: colors.input.border,
      color: colors.input.text,
    },
    inputFocus: {
      borderColor: colors.input.focus,
      outlineColor: colors.input.focus,
    },
  };
};
