import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Home, Dumbbell, History, User, Menu, X, ShieldCheck, Users2, UserCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { themeClasses, cn } from '../theme/constants';
import { useColors } from '../theme';
import { ConfirmDialog } from './ConfirmDialog';
import { getUnreadCount, subscribeToMessages } from '../services/messages';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!authUser?.id) return;
    getUnreadCount().then(setUnread).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(setUnread).catch(() => {});
    }, 30_000);
    // Increment badge immediately on new incoming message
    const unsub = subscribeToMessages(
      authUser.id,
      () => setUnread((n) => n + 1),
      () => {},
    );
    return () => { clearInterval(interval); unsub(); };
  }, [authUser?.id]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (handleBackToSelect) handleBackToSelect();
    else navigate('/dashboard');
  };

  const displayName = authUser?.name || authUser?.email || 'Usuario';
  const displayInitial = displayName[0]?.toUpperCase() || 'U';
  const avatarUrl = authUser?.avatar_url;

  const getUserColor = (name: string): string => {
    const palette = ['#a3e635', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return palette[name.charCodeAt(0) % palette.length];
  };

  const userColor = getUserColor(displayName);

  const menuItems = [
    ...(showBackButton ? [{ icon: Home, label: 'Dashboard', action: () => navigate('/dashboard') }] : []),
    { icon: History, label: 'Historial', action: () => navigate('/history') },
    { icon: User, label: 'Perfil', action: () => navigate('/profile') },
    ...(authUser?.role === 'coach' ? [{ icon: Users2, label: 'Panel de coach', action: () => navigate('/coach') }] : []),
    ...(authUser?.role === 'user' ? [{ icon: UserCheck, label: 'Mi Coach', action: () => navigate('/my-coach') }] : []),
    ...(authUser?.role === 'admin' ? [{ icon: ShieldCheck, label: 'Admin', action: () => navigate('/admin') }] : []),
    { icon: MessageSquare, label: 'Mensajes', action: () => navigate('/messages'), badge: unread > 0 ? unread : undefined },
    { icon: LogOut, label: 'Cerrar sesión', action: () => setShowLogoutDialog(true), danger: true },
  ];

  return (
    <>
      <div className={cn(themeClasses.layout.flexBetween, 'mb-8 gap-3 min-w-0')}>
        {/* Izquierda: avatar + nombre */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="w-11 h-11 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold transition-[transform] duration-150 hover:scale-105 active:scale-95"
              style={avatarUrl ? undefined : { backgroundColor: userColor, color: colors.text.inverse }}
              title="Volver al dashboard"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : displayInitial}
            </button>
          ) : (
            <div
              className="w-11 h-11 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold"
              style={avatarUrl ? undefined : { backgroundColor: userColor, color: colors.text.inverse }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : displayInitial}
            </div>
          )}
          <div className="min-w-0">
            <h1 className={cn('text-xl sm:text-2xl font-bold truncate', themeClasses.text.primary)}>
              {displayName}
            </h1>
            <p className={cn('text-sm', themeClasses.text.tertiary)}>
              {showBackButton ? 'Rutina' : 'Mi Panel'}
            </p>
          </div>
        </div>

        {/* Derecha: menú hamburguesa */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(themeClasses.buttons.icon, 'w-10 h-10')}
            title="Menú"
          >
            {menuOpen
              ? <X className={cn('w-5 h-5', themeClasses.text.primary)} />
              : <Menu className={cn('w-5 h-5', themeClasses.text.primary)} />
            }
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-12 z-50 w-48 rounded-xl shadow-2xl overflow-hidden"
              style={{ background: colors.background.tertiary, border: `1px solid ${colors.border.default}` }}
            >
              {menuItems.map(({ icon: Icon, label, action, danger, badge }: any) => (
                <button
                  key={label}
                  onClick={() => { action(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 text-left"
                  style={{ color: danger ? '#f87171' : colors.text.secondary }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge != null && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-lime-400 text-stone-950 text-[10px] font-bold flex items-center justify-center px-1">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={logout}
        title="Cerrar sesión"
        message="¿Confirmas que deseas cerrar sesión? Nos vemos en tu próximo entrenamiento."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        icon={<Dumbbell className="w-12 h-12" />}
        variant="default"
      />
    </>
  );
};
