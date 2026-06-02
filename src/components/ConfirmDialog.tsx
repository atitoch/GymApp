import React, { useEffect } from "react";
import { X, Dumbbell } from "lucide-react";
import { themeClasses, cn } from "../theme/constants";
import { useColors } from "../theme";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon,
  variant = "default",
}) => {
  const colors = useColors();

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Colores según la variante - Diseño profesional para gimnasio
  const variantStyles = {
    default: {
      iconBg: `linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)`,
      iconBorder: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
      iconColor: colors.primary[400],
      borderColor: colors.primary[500] + "40",
      gradient: `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)`,
      accentColor: colors.primary[500],
    },
    warning: {
      iconBg: `linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)`,
      iconBorder: `linear-gradient(135deg, ${colors.status.warning}, #f59e0b)`,
      iconColor: colors.status.warning,
      borderColor: colors.status.warning + "40",
      gradient: `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)`,
      accentColor: colors.status.warning,
    },
    danger: {
      iconBg: `linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)`,
      iconBorder: `linear-gradient(135deg, ${colors.status.error}, #dc2626)`,
      iconColor: colors.status.error,
      borderColor: colors.status.error + "40",
      gradient: `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)`,
      accentColor: colors.status.error,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 backdrop-blur-sm opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
        style={{ backgroundColor: colors.background.overlay }}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border-2 p-8 shadow-2xl",
          "opacity-0 scale-95 animate-[fadeInScale_0.3s_ease-out_forwards]",
          "backdrop-blur-xl"
        )}
        style={{
          background: styles.gradient,
          borderColor: styles.borderColor,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${styles.borderColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-colors",
            themeClasses.buttons.icon
          )}
          aria-label="Cerrar"
        >
          <X className={cn("w-5 h-5", themeClasses.text.tertiary)} />
        </button>

        {/* Contenido */}
        <div className="flex flex-col items-center text-center">
          {/* Icono con borde metálico */}
          <div className="mb-6 relative">
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40"
              style={{
                background: `radial-gradient(circle, ${styles.accentColor} 0%, transparent 70%)`,
              }}
            />
            {icon ? (
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-2"
                style={{
                  background: styles.iconBg,
                  borderColor: styles.accentColor,
                  boxShadow: `0 0 20px ${styles.accentColor}30, inset 0 0 20px rgba(0, 0, 0, 0.3)`,
                }}
              >
                <div className="text-white drop-shadow-lg">{icon}</div>
              </div>
            ) : (
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-2"
                style={{
                  background: styles.iconBg,
                  borderColor: styles.accentColor,
                  boxShadow: `0 0 20px ${styles.accentColor}30, inset 0 0 20px rgba(0, 0, 0, 0.3)`,
                }}
              >
                <Dumbbell className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Título */}
          <h2
            className={cn(
              "text-2xl font-bold mb-3 tracking-tight",
              themeClasses.text.primary
            )}
            style={{
              textShadow: `0 2px 8px rgba(0, 0, 0, 0.5)`,
            }}
          >
            {title}
          </h2>

          {/* Mensaje */}
          <p
            className={cn(
              "text-base leading-relaxed mb-8 max-w-sm",
              themeClasses.text.secondary
            )}
          >
            {message}
          </p>

          {/* Botones */}
          <div className="flex gap-3 w-full min-h-[3.5rem]">
            <button
              onClick={onClose}
              className={cn(
                "flex-1 px-6 py-3.5 rounded-xl font-semibold",
                "border-2 border-stone-700 bg-stone-800/80",
                "text-stone-300 shadow-lg",
                "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
                "hover:border-stone-600 hover:bg-stone-700/80",
                "hover:text-stone-200 hover:shadow-xl",
                "active:scale-[0.98] active:transition-transform active:duration-100"
              )}
              style={{
                willChange: "transform, background-color, box-shadow",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                "flex-1 px-6 py-3.5 rounded-xl font-semibold text-white",
                "transition-[box-shadow,transform,opacity] duration-200 ease-out",
                "shadow-lg",
                "hover:opacity-95",
                "active:scale-[0.98] active:transition-transform active:duration-100"
              )}
              style={{
                background: `linear-gradient(135deg, ${styles.accentColor}, ${styles.accentColor}dd)`,
                boxShadow: `0 10px 25px -5px ${styles.accentColor}40, 0 0 0 1px ${styles.accentColor}30`,
                willChange: "transform, box-shadow",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 15px 35px -5px ${styles.accentColor}60, 0 0 0 1px ${styles.accentColor}40`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${styles.accentColor}40, 0 0 0 1px ${styles.accentColor}30`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Decoración de fondo - Efectos sutiles de gimnasio */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${styles.accentColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${styles.accentColor}dd 0%, transparent 70%)`,
          }}
        />

        {/* Líneas decorativas en las esquinas */}
        <div
          className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl"
          style={{ borderColor: styles.accentColor + "30" }}
        />
        <div
          className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl"
          style={{ borderColor: styles.accentColor + "30" }}
        />
      </div>
    </div>
  );
};
