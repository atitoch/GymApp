import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { DayRoutine } from './pages/dayRoutine';
import { Login } from './pages/login';
import { LandingPage } from './pages/LandingPage';
import { NotFound } from './pages/notFound';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import WorkoutHistory from './pages/WorkoutHistory';
import ProfileSettings from './pages/ProfileSettings';

import { AuthCallback } from './pages/auth/callback';
import { AuthError } from './pages/auth/error';
import { VerifyEmail } from './pages/auth/verify-email';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { CoachRoute } from './components/CoachRoute';
import { CoachDashboard } from './pages/coach/index';
import { ClientDetail } from './pages/coach/ClientDetail';
import { CoachClients } from './pages/coach/Clients';
import { CoachRequests } from './pages/coach/Requests';
import { CoachRoutines } from './pages/coach/Routines';
import { CoachPlans } from './pages/coach/Plans';
import { CoachExercises } from './pages/coach/Exercises';
import { RoutineEditor } from './pages/coach/RoutineEditor';
import { CoachProfileEditor } from './pages/coach/ProfileEditor';
import { BrowseCoaches } from './pages/coaches/Browse';
import { CoachProfile } from './pages/coaches/CoachProfile';
import { MyCoach } from './pages/MyCoach';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuth } from './contexts/useAuth';
import { AdminDashboard } from './pages/admin/index';
import { AdminApplications } from './pages/admin/Applications';
import { AdminCoaches } from './pages/admin/Coaches';
import { AdminUsers } from './pages/admin/Users';
import { AdminSystemHealth } from './pages/admin/SystemHealth';
import { AdminDocuments } from './pages/admin/Documents';
import { ApplyAsCoach } from './pages/ApplyAsCoach';
import { Messages } from './pages/Messages';
import { Chat } from './pages/Chat';

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
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <WorkoutHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/apply-as-coach" element={<ProtectedRoute><ApplyAsCoach /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:partnerId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/coach" element={<CoachRoute><CoachDashboard /></CoachRoute>} />
        <Route path="/coach/clients" element={<CoachRoute><CoachClients /></CoachRoute>} />
        <Route path="/coach/requests" element={<CoachRoute><CoachRequests /></CoachRoute>} />
        <Route path="/coach/clients/:userId" element={<CoachRoute><ClientDetail /></CoachRoute>} />
        <Route path="/coach/edit-profile" element={<CoachRoute><CoachProfileEditor /></CoachRoute>} />
        <Route path="/coach/plans" element={<CoachRoute><CoachPlans /></CoachRoute>} />
        <Route path="/coach/exercises" element={<CoachRoute><CoachExercises /></CoachRoute>} />
        <Route path="/coach/routines" element={<CoachRoute><CoachRoutines /></CoachRoute>} />
        <Route path="/coach/routines/new" element={<CoachRoute><RoutineEditor /></CoachRoute>} />
        <Route path="/coach/routines/:routineId/edit" element={<CoachRoute><RoutineEditor /></CoachRoute>} />
        <Route path="/coaches" element={<ProtectedRoute><BrowseCoaches /></ProtectedRoute>} />
        <Route path="/coaches/:id" element={<ProtectedRoute><CoachProfile /></ProtectedRoute>} />
        <Route path="/my-coach" element={<ProtectedRoute><MyCoach /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/coaches" element={<AdminRoute><AdminCoaches /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/system" element={<AdminRoute><AdminSystemHealth /></AdminRoute>} />
        <Route path="/admin/documents" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
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
