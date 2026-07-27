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
const SESSION_STARTED_KEY = "auth_session_started_at";

// Edad máxima de una sesión guardada. Sin esto, un `auth_user` en localStorage
// vive para siempre: quien abra la app en ese dispositivo entra directo al
// perfil del último que la usó. Acota la ventana; no sustituye cerrar sesión.
const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Resultado de validar la sesión guardada contra el backend.
 * - ok:          el token es válido; `user` es la identidad autoritativa.
 * - invalid:     el servidor rechazó el token (401/403) — la sesión no sirve.
 * - unverified:  no se pudo contactar al servidor (sin conexión).
 */
type VerifyResult =
  | { status: 'ok'; user: User }
  | { status: 'invalid' }
  | { status: 'unverified' };

// Evita reportar el mismo desajuste más de una vez por carga (StrictMode monta
// el efecto dos veces en desarrollo, y el efecto puede re-ejecutarse).
const reportedMismatches = new Set<string>();

/**
 * Pide /users/profile con el token y construye el usuario a partir de la
 * RESPUESTA, no de lo que hubiera en localStorage. El backend deriva el perfil
 * del token, así que `id`/`email` de ahí son la única fuente de identidad
 * confiable: tomarlos de `baseUser` permitía quedar con la identidad de una
 * cuenta y el nombre/avatar de otra.
 */
const verifyAndEnrichUser = async (
  token: string,
  baseUser: User,
): Promise<VerifyResult> => {
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  } catch {
    // Fallo de red: no podemos validar, pero tampoco es evidencia de que la
    // sesión sea inválida (usuario sin señal en el gym).
    return { status: 'unverified' };
  }

  if (response.status === 401 || response.status === 403) {
    return { status: 'invalid' };
  }
  if (!response.ok) return { status: 'unverified' };

  try {
    const data = await response.json();
    const profile = data.data ?? data;
    if (!profile?.id) return { status: 'unverified' };

    // La identidad guardada no era la del token: es exactamente el caso que
    // dejaba ver el perfil de otra cuenta. Se corrige (abajo) y se reporta
    // para tener trazabilidad si vuelve a ocurrir.
    if (baseUser.id && profile.id !== baseUser.id) {
      const key = `${baseUser.id}->${profile.id}`;
      if (!reportedMismatches.has(key)) {
        reportedMismatches.add(key);
        authService.reportSessionEvent(token, 'identity_mismatch', {
          storedUserId: baseUser.id,
        });
      }
    }

    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return {
      status: 'ok',
      user: {
        ...baseUser,
        // Identidad SIEMPRE del perfil devuelto para este token
        id: profile.id,
        email: profile.email ?? baseUser.email,
        role: profile.role ?? 'user',
        coachStatus: profile.coach_status ?? null,
        name: fullName || baseUser.name,
        avatar_url: profile.avatar_url ?? baseUser.avatar_url,
      },
    };
  } catch {
    return { status: 'unverified' };
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
    let cancelled = false;

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
          // Sesión demasiado vieja: se descarta sin siquiera mostrarla
          const startedAt = Number(localStorage.getItem(SESSION_STARTED_KEY) ?? 0);
          if (!startedAt || Date.now() - startedAt > MAX_SESSION_AGE_MS) {
            clearSession();
            setIsLoading(false);
            return;
          }

          let parsed: User;
          try {
            parsed = JSON.parse(storedUser);
          } catch {
            clearSession();
            setIsLoading(false);
            return;
          }

          if (
            !parsed ||
            typeof parsed.id !== 'string' ||
            typeof parsed.email !== 'string'
          ) {
            clearSession();
            setIsLoading(false);
            return;
          }

          // Validar ANTES de renderizar: pintar el usuario guardado de entrada
          // era lo que mostraba el perfil de otra persona cuando el token ya
          // no era válido (el fallo se tragaba y se quedaba lo de localStorage).
          const result = await verifyAndEnrichUser(storedToken, parsed);
          if (cancelled) return;

          if (result.status === 'invalid') {
            clearSession();
            setIsLoading(false);
            return;
          }

          setToken(storedToken);
          if (result.status === 'ok') {
            setUser(result.user);
            localStorage.setItem(USER_KEY, JSON.stringify(result.user));
          } else {
            // Sin conexión: se usa la sesión guardada para permitir trabajar
            // offline; la identidad se corrige en cuanto vuelva la red.
            setUser(parsed);
          }
        }
      } catch {
        // No limpiar sesión aquí, podría ser error temporal
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
    return () => { cancelled = true; };
  }, []);

  const saveSession = (authData: AuthResponse) => {
    setToken(authData.token);
    setUser(authData.user);

    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    localStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));

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
    localStorage.removeItem(SESSION_STARTED_KEY);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const authData = await authService.login(credentials);
      saveSession(authData);
      const result = await verifyAndEnrichUser(authData.token, authData.user);
      let role: string | undefined;
      if (result.status === 'ok') {
        setUser(result.user);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        role = result.user.role;
      }

      navigate(role === 'admin' ? '/admin' : '/dashboard');
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
    // El login OAuth se resuelve en el navegador y el backend nunca se entera;
    // este aviso es lo único que deja rastro del acceso en auth_events.
    authService.reportSessionEvent(authData.token, 'login_ok', {
      provider: 'oauth',
    });
    verifyAndEnrichUser(authData.token, authData.user).then((result) => {
      if (result.status !== 'ok') return;
      setUser(result.user);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    });
  };

  const updateUser = (updates: Partial<import('./authContext').User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
