import { createContext } from "react";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../services/auth";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setAuthData: (authData: AuthResponse) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

