/**
 * Tipos para el sistema de diseño y colores
 */

export interface ColorPalette {
  // Colores primarios
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Colores secundarios
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Colores de fondo
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  
  // Colores de texto
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    placeholder: string;
  };
  
  // Colores de estado
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Colores de borde
  border: {
    default: string;
    hover: string;
    focus: string;
    error: string;
  };
  
  // Colores de botones
  button: {
    primary: {
      bg: string;
      hover: string;
      text: string;
      shadow: string;
    };
    secondary: {
      bg: string;
      hover: string;
      text: string;
      border: string;
    };
    ghost: {
      bg: string;
      hover: string;
      text: string;
    };
  };
  
  // Colores de input
  input: {
    bg: string;
    border: string;
    focus: string;
    placeholder: string;
    text: string;
  };
  
  // Colores de card
  card: {
    bg: string;
    hover: string;
    border: string;
    shadow: string;
  };
}

export interface ThemeConfig {
  name: string;
  colors: ColorPalette;
}

export interface ThemeContextValue {
  currentTheme: ThemeConfig;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

