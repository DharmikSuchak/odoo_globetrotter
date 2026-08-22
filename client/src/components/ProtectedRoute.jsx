import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Renders `children` only when the user is authenticated.
 * Otherwise redirects to /login, preserving the intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
