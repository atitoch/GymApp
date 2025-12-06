import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { DayRoutine } from "./pages/dayRoutine";
import { Login } from "./pages/login";
import { LandingPage } from "./pages/LandingPage";
import { NotFound } from "./pages/notFound";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";

import { AuthCallback } from "./pages/auth/callback";
import { AuthError } from "./pages/auth/error";
import { VerifyEmail } from "./pages/auth/verify-email";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { useAuth } from "./contexts/useAuth";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routine/:dayIndex"
        element={
          <ProtectedRoute>
            <DayRoutine />
          </ProtectedRoute>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
