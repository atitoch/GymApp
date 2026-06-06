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
const REMEMBER_KEY = "auth_remember";

// Devuelve el storage correcto según la preferencia guardada
const getAuthStorage = (): Storage => {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

const enrichUserWithRole = async (token: string, baseUser: User): Promise<User> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return baseUser;
    const data = await response.json();
    const profile = data.data ?? data;
    return { ...baseUser, role: profile.role ?? 'user', coachStatus: profile.coach_status ?? null };
  } catch {
    return baseUser;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar datos de sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        try {
          const testKey = "__localStorage_test__";
          localStorage.setItem(testKey, "test");
          localStorage.removeItem(testKey);
        } catch {
          setIsLoading(false);
          return;
        }

        // Buscar token en localStorage primero (remember me), luego en sessionStorage
        const storedToken =
          localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
        const storedUser =
          localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);

        // Compatibilidad con sesiones guardadas antes del feature de "recordarme":
        // si hay token en localStorage pero sin REMEMBER_KEY, marcarlo como recordado
        if (localStorage.getItem(TOKEN_KEY) && !localStorage.getItem(REMEMBER_KEY)) {
          localStorage.setItem(REMEMBER_KEY, 'true');
        }

        if (storedToken && storedUser) {
          setToken(storedToken);
          try {
            const parsed = JSON.parse(storedUser);
            if (
              parsed &&
              typeof parsed.id === 'string' &&
              typeof parsed.email === 'string'
            ) {
              setUser(parsed);
              // Refresh role in background
              enrichUserWithRole(storedToken, parsed).then(enriched => {
                setUser(enriched);
                getAuthStorage().setItem(USER_KEY, JSON.stringify(enriched));
              });
            } else {
              clearSession();
              setIsLoading(false);
              return;
            }
          } catch {
            clearSession();
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // No limpiar sesión aquí, podría ser error temporal
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const saveSession = (authData: AuthResponse, rememberMe?: boolean) => {
    // Si se pasa rememberMe explícito, actualizar la preferencia; si no, mantener la existente
    if (rememberMe !== undefined) {
      localStorage.setItem(REMEMBER_KEY, String(rememberMe));
    }
    const storage = getAuthStorage();

    setToken(authData.token);
    setUser(authData.user);

    storage.setItem(TOKEN_KEY, authData.token);
    storage.setItem(USER_KEY, JSON.stringify(authData.user));

    if (authData.refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(REFRESH_TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
    localStorage.removeItem(REMEMBER_KEY);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const authData = await authService.login(credentials);
      saveSession(authData, credentials.rememberMe ?? false);
      const enriched = await enrichUserWithRole(authData.token, authData.user);
      setUser(enriched);
      getAuthStorage().setItem(USER_KEY, JSON.stringify(enriched));

      navigate(enriched.role === 'admin' ? '/admin' : '/dashboard');
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
    } catch {
      // Error silencioso al cerrar sesión
    } finally {
      clearSession();
      navigate("/");
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
      navigate("/");
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
    isAdmin: !!user && user.role === 'admin',
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
