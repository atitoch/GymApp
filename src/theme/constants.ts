/**
 * Constantes de clases de Tailwind basadas en el sistema de diseño
 *
 * Este archivo centraliza todas las clases de Tailwind más usadas
 * para facilitar su mantenimiento y actualización
 */

export const themeClasses = {
  // ===== BACKGROUNDS =====
  backgrounds: {
    primary: "bg-stone-950",
    secondary: "bg-stone-900",
    tertiary: "bg-stone-800",
    overlay: "bg-stone-900/50",
    card: "bg-stone-800",
    cardHover: "bg-stone-700",
    input: "bg-stone-900/50",
    buttonPrimary: "bg-gradient-to-r from-lime-400 to-lime-500",
    buttonPrimaryHover: "hover:from-lime-500 hover:to-lime-600",
    buttonSecondary: "bg-stone-800",
    buttonSecondaryHover: "hover:bg-stone-700",
    buttonGhost: "bg-transparent",
    buttonGhostHover: "hover:bg-stone-800",
  },

  // ===== TEXT =====
  text: {
    primary: "text-stone-50",
    secondary: "text-stone-300",
    tertiary: "text-stone-400",
    placeholder: "text-stone-500",
    inverse: "text-stone-900",
    white: "text-white",
    // Primary colors — usan CSS var inyectada por ThemeProvider
    accent: "text-[--color-accent-400]",
    accentHover: "hover:text-[--color-accent-400]",
    accentLight: "text-[--color-accent-300]",
    // Status colors
    success: "text-green-400",
    warning: "text-[--color-accent-400]",
    error: "text-red-400",
    info: "text-[--color-accent-400]",
  },

  // ===== BORDERS =====
  borders: {
    default: "border-stone-700",
    hover: "border-stone-600",
    focus: "border-[--color-accent-400]",
    error: "border-red-500",
    card: "border-stone-700",
    input: "border-stone-700",
    inputFocus: "focus:border-[--color-accent-400]",
  },

  // ===== BUTTONS =====
  buttons: {
    primary:
      "bg-gradient-to-r from-[--color-accent-400] to-[--color-accent-500] hover:from-[--color-accent-500] hover:to-[--color-accent-600] text-stone-950 font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    secondary:
      "bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent hover:bg-stone-800 text-[--color-accent-400] hover:text-[--color-accent-300] font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "p-2 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors",
  },

  // ===== INPUTS =====
  inputs: {
    base: "w-full bg-stone-900/50 border border-stone-700 rounded-lg px-4 py-2.5 text-stone-50 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[--color-accent-400] focus:border-[--color-accent-400] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
    text: "text-sm",
  },

  // ===== CARDS =====
  cards: {
    base: "bg-stone-800 rounded-xl p-6",
    hover: "hover:bg-stone-700/50 transition-colors",
    interactive:
      "bg-stone-800 hover:bg-stone-700 rounded-xl p-6 transition-all duration-300 hover:scale-105",
    withShadow: "hover:shadow-xl hover:shadow-[--color-accent-400]/20",
  },

  // ===== STATUS =====
  status: {
    success: "text-green-400 bg-green-500/10 border border-green-500/50",
    warning: "text-[--color-accent-400] bg-[--color-accent-400]/10 border border-[--color-accent-400]/50",
    error: "text-red-400 bg-red-500/10 border border-red-500/50",
    info: "text-[--color-accent-400] bg-[--color-accent-400]/10 border border-[--color-accent-400]/50",
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
    shadowPrimary: "shadow-lg shadow-[--color-accent-400]/30",
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
