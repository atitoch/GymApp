# Sistema de Diseño - GymApp

Este directorio contiene el sistema de diseño centralizado para toda la aplicación. Todos los colores, estilos y paletas están definidos aquí, permitiendo cambios globales desde un solo lugar.

## Estructura

```
theme/
├── types.ts          # Tipos TypeScript para el sistema de diseño
├── colors.ts         # Definición de colores y paletas
├── ThemeProvider.tsx # Provider de React para el tema
├── hooks.ts          # Hooks personalizados (useColors, useThemeClasses, etc.)
├── constants.ts      # Constantes de clases de Tailwind
├── utils.ts          # Utilidades para trabajar con colores
└── index.ts          # Exportaciones centralizadas
```

## Uso Básico

### 1. Usar el ThemeProvider

El `ThemeProvider` ya está configurado en `main.tsx`. Puedes acceder al tema desde cualquier componente:

```tsx
import { useColors, useTheme } from '../theme';

function MyComponent() {
  const colors = useColors();
  const { currentTheme, setTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background.primary }}>
      <p style={{ color: colors.text.primary }}>Texto</p>
    </div>
  );
}
```

### 2. Usar clases de Tailwind (Recomendado)

Para la mayoría de casos, es mejor usar las constantes de clases:

```tsx
import { themeClasses } from '../theme/constants';

function MyComponent() {
  return (
    <div className={themeClasses.backgrounds.primary}>
      <p className={themeClasses.text.primary}>Texto</p>
      <button className={themeClasses.buttons.primary}>
        Botón
      </button>
    </div>
  );
}
```

### 3. Combinar clases

Usa la función `cn` para combinar clases:

```tsx
import { themeClasses, cn } from '../theme/constants';

function MyCard({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(
      themeClasses.cards.base,
      themeClasses.cards.hover,
      isActive && 'ring-2 ring-blue-500'
    )}>
      Contenido
    </div>
  );
}
```

## Paletas por Coach

El sistema está preparado para soportar paletas personalizadas por coach. Actualmente hay 4 paletas predefinidas:

- `default` - Paleta base (azul)
- `coach1` - Paleta sky blue
- `coach2` - Paleta fuchsia
- `coach3` - Paleta naranja

### Cambiar tema

```tsx
import { useTheme } from '../theme';

function Settings() {
  const { setTheme, availableThemes } = useTheme();
  
  return (
    <select onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map(theme => (
        <option key={theme} value={theme}>{theme}</option>
      ))}
    </select>
  );
}
```

### Integración con Base de Datos (Futuro)

Cuando se conecte con el backend, puedes obtener el tema del coach así:

```tsx
// Ejemplo futuro
import { getThemeByCoachId } from '../theme/colors';

// En un componente que recibe coachId del backend
function App({ coachId }: { coachId: string }) {
  const theme = getThemeByCoachId(coachId);
  // El ThemeProvider puede recibir coachId como prop
}
```

## Estructura de Colores

Cada paleta incluye:

- **primary**: Colores primarios (50-950)
- **secondary**: Colores secundarios (50-950)
- **background**: Fondos (primary, secondary, tertiary, overlay)
- **text**: Colores de texto (primary, secondary, tertiary, inverse, placeholder)
- **status**: Colores de estado (success, warning, error, info)
- **border**: Colores de borde (default, hover, focus, error)
- **button**: Estilos de botones (primary, secondary, ghost)
- **input**: Estilos de inputs
- **card**: Estilos de tarjetas

## Agregar una Nueva Paleta

1. Abre `src/theme/colors.ts`
2. Crea una nueva paleta basada en `basePalette`:

```ts
const nuevaPaleta: ColorPalette = {
  ...basePalette,
  primary: {
    // Define tus colores primarios
    500: '#TU_COLOR',
    // ...
  },
};
```

3. Regístrala en el objeto `themes`:

```ts
export const themes: Record<string, ThemeConfig> = {
  // ...
  nuevaPaleta: {
    name: 'nuevaPaleta',
    colors: nuevaPaleta,
  },
};
```

## Mejores Prácticas

1. **Usa las constantes**: Prefiere `themeClasses` sobre clases hardcodeadas
2. **Mantén consistencia**: Usa los colores del tema en lugar de valores hardcodeados
3. **Extiende cuando sea necesario**: Si necesitas un estilo específico, agrégalo a `constants.ts`
4. **Documenta cambios**: Si agregas nuevas paletas o colores, actualiza esta documentación

## Ejemplos

### Botón primario
```tsx
<button className={themeClasses.buttons.primary}>
  Click me
</button>
```

### Card interactiva
```tsx
<div className={cn(
  themeClasses.cards.interactive,
  themeClasses.cards.withShadow
)}>
  Contenido
</div>
```

### Input con validación
```tsx
<input
  className={cn(
    themeClasses.inputs.base,
    themeClasses.inputs.text,
    hasError && themeClasses.status.error
  )}
/>
```

### Estado de éxito
```tsx
<div className={themeClasses.status.success}>
  Operación exitosa
</div>
```

