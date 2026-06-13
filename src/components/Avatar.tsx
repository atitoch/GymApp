import React from 'react';

const PALETTE = ['#a3e635', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const colorFor = (name: string) => PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];

interface AvatarProps {
  url?: string | null;
  name: string;
  /** Diámetro en px */
  size?: number;
  className?: string;
  /** Colorea la inicial con la paleta por nombre; si es false usa el acento lima */
  colored?: boolean;
}

/**
 * Avatar circular: muestra la foto si existe, si no la inicial del nombre.
 * Si la imagen falla al cargar cae a la inicial automáticamente.
 */
export const Avatar: React.FC<AvatarProps> = ({ url, name, size = 40, className = '', colored = false }) => {
  const [broken, setBroken] = React.useState(false);
  const initial = name?.[0]?.toUpperCase() || '?';
  const showImg = url && !broken;

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        ...(showImg
          ? {}
          : colored
            ? { backgroundColor: colorFor(name || '?'), color: '#0c0a09' }
            : { backgroundColor: 'rgba(163,230,53,0.2)', color: '#a3e635' }),
      }}
    >
      {showImg ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
};
