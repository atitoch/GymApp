import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Loader2 } from 'lucide-react';

export const CoachRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'coach') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
