/**
 * ThemeProvider - Proporciona el tema actual a toda la aplicación
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { ThemeContextValue, ThemeConfig } from "./types";
import { getTheme, getThemeByCoachId, themes } from "./colors";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  coachId?: string | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "default",
  coachId = null,
}) => {
  // Determinar el tema inicial
  const getInitialTheme = (): ThemeConfig => {
    if (coachId) {
      return getThemeByCoachId(coachId);
    }
    // Intentar obtener del localStorage
    const savedTheme = localStorage.getItem("gymapp-theme");
    if (savedTheme && themes[savedTheme]) {
      return getTheme(savedTheme);
    }
    return getTheme(initialTheme);
  };

  const [currentTheme, setCurrentThemeState] =
    useState<ThemeConfig>(getInitialTheme);

  // Actualizar tema cuando cambie el coachId
  useEffect(() => {
    if (coachId) {
      const theme = getThemeByCoachId(coachId);
      setCurrentThemeState(theme);
    }
  }, [coachId]);

  // Sincronizar colores del tema activo como CSS variables en :root
  const syncCSSVars = useCallback((theme: ThemeConfig) => {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty('--color-accent-300', c.primary[300]);
    root.style.setProperty('--color-accent-400', c.primary[400]);
    root.style.setProperty('--color-accent-500', c.primary[500]);
    root.style.setProperty('--color-accent-600', c.primary[600]);
  }, []);

  useEffect(() => {
    syncCSSVars(currentTheme);
  }, [currentTheme, syncCSSVars]);

  const setTheme = (themeName: string) => {
    const theme = getTheme(themeName);
    setCurrentThemeState(theme);
    localStorage.setItem("gymapp-theme", themeName);
  };

  const value: ThemeContextValue = {
    currentTheme,
    setTheme,
    availableThemes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Exportar el contexto para que useTheme pueda usarlo
export { ThemeContext };
