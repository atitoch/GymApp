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
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Verificar si el token sigue siendo válido
          const verification = await authService.verifyToken(storedToken);

          if (verification.valid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Intentar refrescar el token
            const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshTokenValue) {
              try {
                const authData = await authService.refreshToken(
                  refreshTokenValue
                );
                saveSession(authData);
              } catch {
                // Si falla el refresh (400 = token inválido/expirado, comportamiento esperado),
                // limpiar sesión silenciosamente sin loguear error
                clearSession();
              }
            } else {
              clearSession();
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar sesión:", error);
        clearSession();
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
