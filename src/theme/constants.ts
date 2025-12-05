/**
 * Constantes de clases de Tailwind basadas en el sistema de diseño
 *
 * Este archivo centraliza todas las clases de Tailwind más usadas
 * para facilitar su mantenimiento y actualización
 */

export const themeClasses = {
  // ===== BACKGROUNDS =====
  backgrounds: {
    primary: "bg-slate-950",
    secondary: "bg-slate-900",
    tertiary: "bg-slate-800",
    overlay: "bg-slate-900/50",
    card: "bg-slate-800",
    cardHover: "bg-slate-700",
    input: "bg-slate-900/50",
    buttonPrimary: "bg-gradient-to-r from-blue-500 to-blue-600",
    buttonPrimaryHover: "hover:from-blue-600 hover:to-blue-700",
    buttonSecondary: "bg-slate-800",
    buttonSecondaryHover: "hover:bg-slate-700",
    buttonGhost: "bg-transparent",
    buttonGhostHover: "hover:bg-slate-800",
  },

  // ===== TEXT =====
  text: {
    primary: "text-slate-50",
    secondary: "text-slate-300",
    tertiary: "text-slate-400",
    placeholder: "text-slate-500",
    inverse: "text-slate-900",
    white: "text-white",
    // Primary colors
    accent: "text-blue-500",
    accentHover: "hover:text-blue-400",
    accentLight: "text-blue-400",
    // Status colors
    success: "text-green-400",
    warning: "text-amber-500",
    error: "text-red-400",
    info: "text-blue-500",
  },

  // ===== BORDERS =====
  borders: {
    default: "border-slate-700",
    hover: "border-slate-600",
    focus: "border-blue-500",
    error: "border-red-500",
    card: "border-slate-700",
    input: "border-slate-700",
    inputFocus: "focus:border-blue-500",
  },

  // ===== BUTTONS =====
  buttons: {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors",
  },

  // ===== INPUTS =====
  inputs: {
    base: "w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
    text: "text-sm",
  },

  // ===== CARDS =====
  cards: {
    base: "bg-slate-800 rounded-xl p-6",
    hover: "hover:bg-slate-700/50 transition-colors",
    interactive:
      "bg-slate-800 hover:bg-slate-700 rounded-xl p-6 transition-all duration-300 hover:scale-105",
    withShadow: "hover:shadow-xl hover:shadow-blue-500/20",
  },

  // ===== STATUS =====
  status: {
    success: "text-green-400 bg-green-500/10 border border-green-500/50",
    warning: "text-amber-500 bg-amber-500/10 border border-amber-500/50",
    error: "text-red-400 bg-red-500/10 border border-red-500/50",
    info: "text-blue-400 bg-blue-500/10 border border-blue-500/50",
  },

  // ===== LAYOUT =====
  layout: {
    screen: "min-h-screen",
    container: "max-w-4xl mx-auto px-6",
    flexCenter: "flex items-center justify-center",
    flexBetween: "flex items-center justify-between",
  },

  // ===== SPACING =====
  spacing: {
    section: "mb-8",
    card: "p-6",
    button: "px-6 py-3",
  },

  // ===== EFFECTS =====
  effects: {
    backdrop: "backdrop-blur-sm",
    shadow: "shadow-2xl",
    shadowPrimary: "shadow-lg shadow-blue-500/30",
    glow: "animate-pulse",
    scale: "hover:scale-105",
    scaleButton: "hover:scale-[1.02]",
  },
} as const;

/**
 * Helper para combinar clases de manera más fácil
 */
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
