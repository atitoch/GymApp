import React, { useState } from 'react';
import { Calendar, LogOut, Home, Dumbbell, History, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { themeClasses, cn } from '../theme/constants';
import { useColors } from '../theme';
import { ConfirmDialog } from './ConfirmDialog';

interface HeaderProps {
  handleBackToSelect?: () => void;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  handleBackToSelect,
  showBackButton = true,
}) => {
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const colors = useColors();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await logout();
  };

  const handleBack = () => {
    if (handleBackToSelect) {
      handleBackToSelect();
    } else {
      navigate('/dashboard');
    }
  };

  // Usar el usuario autenticado
  const displayName = authUser?.name || authUser?.email || 'Usuario';
  const displayInitial = displayName[0]?.toUpperCase() || 'U';

  // Generar color basado en el nombre del usuario para consistencia
  const getUserColor = (name: string): string => {
    const colors = [
      '#a3e635', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const userColor = getUserColor(displayName);

  return (
    <>
      <div className={cn(themeClasses.layout.flexBetween, 'mb-8')}>
        <div className={themeClasses.layout.flexCenter + ' gap-4'}>
          {showBackButton && (
            <button
              onClick={handleBack}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-transform hover:scale-110"
              style={{
                backgroundColor: userColor,
                color: colors.text.inverse,
              }}
              title="Volver al dashboard"
            >
              {displayInitial}
            </button>
          )}
          {!showBackButton && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: userColor,
                color: colors.text.inverse,
              }}
            >
              {displayInitial}
            </div>
          )}
          <div>
            <h1 className={cn('text-3xl font-bold', themeClasses.text.primary)}>
              {displayName}
            </h1>
            <p className={themeClasses.text.tertiary}>
              {showBackButton ? 'Rutina' : 'Mi Panel'}
            </p>
          </div>
        </div>
        <div className={cn(themeClasses.layout.flexCenter, 'gap-4')}>
          {showBackButton && (
            <button
              onClick={() => navigate('/dashboard')}
              className={themeClasses.buttons.icon}
              title="Ir al dashboard"
            >
              <Home className={cn('w-5 h-5', themeClasses.text.tertiary)} />
            </button>
          )}
          <button
            onClick={() => navigate('/history')}
            className={themeClasses.buttons.icon}
            title="Historial de entrenamientos"
          >
            <History className={cn('w-5 h-5', themeClasses.text.tertiary)} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={themeClasses.buttons.icon}
            title="Configuración de perfil"
          >
            <User className={cn('w-5 h-5', themeClasses.text.tertiary)} />
          </button>
          <Calendar className={cn('w-8 h-8', themeClasses.text.primary)} />
          <button
            onClick={handleLogout}
            className={themeClasses.buttons.icon}
            title="Cerrar sesión"
          >
            <LogOut className={cn('w-5 h-5', themeClasses.text.tertiary)} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="¡Gran trabajo hoy! 💪"
        message="¿Confirmas que deseas cerrar sesión? Nos vemos en tu próximo entrenamiento."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        icon={<Dumbbell className="w-12 h-12" />}
        variant="default"
      />
    </>
  );
};
