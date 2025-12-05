/**
 * Configuración de Tailwind CSS con variables del tema
 * 
 * Nota: Tailwind CSS v4 usa CSS variables directamente en lugar de config JS
 * Este archivo es para referencia y documentación
 * 
 * Las variables CSS se definen en el archivo CSS principal
 */

import type { Config } from 'tailwindcss';

// Esta configuración es principalmente para referencia
// En Tailwind v4, las variables CSS se usan directamente
export const tailwindThemeConfig: Config = {
  theme: {
    extend: {
      colors: {
        // Los colores se pueden acceder vía CSS variables
        // o usando las clases de Tailwind estándar
        // Ejemplo: bg-[var(--color-primary-500)]
      },
    },
  },
};

