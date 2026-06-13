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
  avatar_url?: string | null;
  role?: 'user' | 'coach' | 'admin';
  coachStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setAuthData: (authData: AuthResponse) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

