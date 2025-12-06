import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/auth";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../services/auth";
import { AuthContext, type AuthContextType, type User } from "./authContext";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar datos de sesión al iniciar
  useEffect(() => {
    // Listener para detectar si localStorage se está limpiando
    const storageListener = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY || e.key === REFRESH_TOKEN_KEY) {
        console.warn("[Auth] ⚠️ localStorage fue modificado externamente:", {
          key: e.key,
          oldValue: e.oldValue ? "existe" : "no existe",
          newValue: e.newValue ? "existe" : "no existe",
          url: e.url
        });
      }
    };
    window.addEventListener('storage', storageListener);

    const loadSession = async () => {
      try {
        // Verificar si localStorage está disponible
        try {
          const testKey = '__localStorage_test__';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
        } catch (e) {
          console.error("[Auth] ❌ localStorage no está disponible:", e);
          setIsLoading(false);
          return;
        }

        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        console.log("[Auth] Cargando sesión:", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          hasRefreshToken: !!storedRefreshToken,
          tokenLength: storedToken?.length || 0,
          userLength: storedUser?.length || 0,
          refreshLength: storedRefreshToken?.length || 0
        });

        if (storedToken && storedUser) {
          // Establecer el token y usuario primero (optimistic) para evitar redirección inmediata
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
            console.log("[Auth] Sesión restaurada desde localStorage");
            // NO intentar refrescar el token automáticamente al cargar
            // El token se refrescará automáticamente cuando sea necesario (cuando una petición falle con 401)
            // Esto evita limpiar la sesión si el refresh token está expirado pero el token actual sigue siendo válido
          } catch (parseError) {
            console.error("[Auth] Error al parsear usuario:", parseError);
            clearSession();
            setIsLoading(false);
            return;
          }
        } else {
          console.log("[Auth] No hay sesión guardada en localStorage");
        }
      } catch (error) {
        // Solo limpiar si es un error crítico (parseo, etc.)
        console.error("[Auth] Error inesperado al cargar sesión:", error);
        // No limpiar la sesión aquí, podría ser un error temporal
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Cleanup: remover el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('storage', storageListener);
    };
  }, []);

  const saveSession = (authData: AuthResponse) => {
    console.log("[Auth] Guardando sesión", {
      hasToken: !!authData.token,
      hasUser: !!authData.user,
      hasRefreshToken: !!authData.refreshToken,
      userId: authData.user?.id
    });
    
    setToken(authData.token);
    setUser(authData.user);

    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

    if (authData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
    
    // Verificar que se guardó correctamente
    const verifyToken = localStorage.getItem(TOKEN_KEY);
    const verifyUser = localStorage.getItem(USER_KEY);
    const verifyRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    console.log("[Auth] Verificación después de guardar:", {
      tokenSaved: !!verifyToken,
      userSaved: !!verifyUser,
      refreshSaved: !!verifyRefresh,
      tokenLength: verifyToken?.length || 0,
      userLength: verifyUser?.length || 0
    });
  };

  const clearSession = () => {
    console.log("[Auth] Limpiando sesión");
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const authData = await authService.login(credentials);
      saveSession(authData);

      // Guardar "remember me" si está activado
      if (credentials.rememberMe) {
        // El token ya está guardado, podrías extender su expiración en el backend
      }

      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al iniciar sesión");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      // No guardar sesión aún, el usuario debe verificar su email primero
      // Redirigir a la página de verificación con el email
      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al registrar usuario");
    }
  };

  const logout = async () => {
    try {
      if (token) {
        const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
        await authService.logout(token, refreshTokenValue || undefined);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
      // La redirección se maneja en el servicio
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al iniciar sesión con Google");
    }
  };

  const loginWithGitHub = async () => {
    try {
      await authService.loginWithGitHub();
      // La redirección se maneja en el servicio
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al iniciar sesión con GitHub");
    }
  };

  const refreshAuth = async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshTokenValue) {
      throw new Error("No hay token de refresco disponible");
    }

    try {
      const authData = await authService.refreshToken(refreshTokenValue);
      saveSession(authData);
    } catch (error) {
      clearSession();
      navigate("/login");
      throw error;
    }
  };

  const setAuthData = (authData: AuthResponse) => {
    saveSession(authData);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithGitHub,
    refreshAuth,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
