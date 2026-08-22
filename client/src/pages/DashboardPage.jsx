import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* ── Top nav ───────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-display font-bold text-xl text-white">
              Globe<span className="gradient-text">Trotter</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm">
              Welcome, <span className="text-white font-medium">{currentUser?.name}</span>
            </span>
            <button
              id="dashboard-logout-btn"
              onClick={handleLogout}
              className="btn-ghost text-sm py-2 px-4"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Dashboard body (placeholder for next step) ────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-16 text-center">
        <span className="text-6xl mb-6 block">🗺️</span>
        <h1 className="font-display font-bold text-4xl text-white mb-4">
          Your Dashboard
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          You're logged in as <span className="text-white">{currentUser?.email}</span>.<br />
          Trip planning features are coming in the next step.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Authenticated · JWT active
        </div>
      </main>
    </div>
  );
}
