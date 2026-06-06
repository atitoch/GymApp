import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/auth";
import { supabase } from "../config/supabase";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../services/auth";
import { AuthContext, type AuthContextType, type User } from "./authContext";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

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

        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

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
                localStorage.setItem(USER_KEY, JSON.stringify(enriched));
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

  const saveSession = (authData: AuthResponse) => {
    setToken(authData.token);
    setUser(authData.user);

    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));

    if (authData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
  };

  const clearSession = () => {
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
      const enriched = await enrichUserWithRole(authData.token, authData.user);
      setUser(enriched);
      localStorage.setItem(USER_KEY, JSON.stringify(enriched));

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
      // Cierra también cualquier sesión OAuth de Supabase (Google/GitHub).
      await supabase.auth.signOut();
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
    // Enriquecer el rol en segundo plano (p. ej. tras login OAuth), sin bloquear
    // la navegación. Si el backend no reconoce el token, se conserva el usuario base.
    enrichUserWithRole(authData.token, authData.user).then((enriched) => {
      setUser(enriched);
      localStorage.setItem(USER_KEY, JSON.stringify(enriched));
    });
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
