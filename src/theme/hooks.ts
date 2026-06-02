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
    bgPrimary: "bg-stone-950",
    bgSecondary: "bg-stone-900",
    bgTertiary: "bg-stone-800",
    bgOverlay: "bg-stone-900/50",

    // Text
    textPrimary: "text-stone-50",
    textSecondary: "text-stone-300",
    textTertiary: "text-stone-400",
    textPlaceholder: "text-stone-500",

    // Borders
    borderDefault: "border-stone-700",
    borderHover: "border-stone-600",
    borderFocus: "border-lime-400",

    // Buttons
    btnPrimary:
      "bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white",
    btnSecondary: "bg-stone-800 hover:bg-stone-700 text-stone-300",
    btnGhost: "bg-transparent hover:bg-stone-800 text-lime-400",

    // Cards
    card: "bg-stone-800 hover:bg-stone-700 border border-stone-700",

    // Inputs
    input:
      "bg-stone-900/50 border border-stone-700 focus:border-lime-400 text-stone-50 placeholder-stone-500",

    // Status colors
    success: "text-green-500 bg-green-500/10 border-green-500/50",
    warning: "text-lime-400 bg-lime-400/10 border-lime-400/50",
    error: "text-red-500 bg-red-500/10 border-red-500/50",
    info: "text-lime-400 bg-lime-400/10 border-lime-400/50",
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
