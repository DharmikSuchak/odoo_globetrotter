import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import TripsPage from "./pages/TripsPage";
import CreateTripPage from "./pages/CreateTripPage";
import TripBuilderPage from "./pages/TripBuilderPage";
import PublicTripPage from "./pages/PublicTripPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

/** Redirects authenticated users away from auth screens.
 *  Admins land on /admin; regular users land on /dashboard. */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return children;
  return <Navigate to={currentUser?.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
}

/** Blocks admin users from regular-user pages — sends them to /admin. */
function UserOnlyRoute({ children }) {
  const { currentUser } = useAuth();
  if (currentUser?.role === "ADMIN") return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* ── Public Trip Share ────────────────────────────────────────── */}
      <Route path="/trip/share/:slug" element={<PublicTripPage />} />

      {/* ── Protected Dashboard Routes ─────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserOnlyRoute><DashboardPage /></UserOnlyRoute>} />
        <Route path="/trips" element={<UserOnlyRoute><TripsPage /></UserOnlyRoute>} />
        <Route path="/trips/new" element={<UserOnlyRoute><CreateTripPage /></UserOnlyRoute>} />
        <Route path="/trips/:id" element={<UserOnlyRoute><TripBuilderPage /></UserOnlyRoute>} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
