import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Derive 1–2 uppercase initials from a full name. */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/** Deterministic sky-blue color from a name string. */
function getAvatarColor(name) {
  const palette = ["#0284c7", "#0369a1", "#0ea5e9", "#075985", "#0c4a6e"];
  if (!name) return palette[0];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

// NavLink className helper — keeps active-state logic in one place
function navLinkClass({ isActive }) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
    isActive
      ? "bg-sky-50 text-sky-700 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.15)]"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

// Regular user nav items — hidden from admin accounts
const userNavItems = [
  { name: "Dashboard",   path: "/dashboard", exact: true },
  { name: "My Trips",    path: "/trips"                  },
  { name: "Create Trip", path: "/trips/new"              },
  { name: "Profile",     path: "/profile"                },
];

// Admin-only nav items
const adminNavItems = [
  { name: "Profile", path: "/profile" },
];

export default function DashboardLayout() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* ── Fixed Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-[240px] fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">
              Globe<span className="text-sky-600">Trotter</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // For /dashboard use exact match; others allow prefix match
              end={item.exact}
              className={navLinkClass}
            >
              {({ isActive }) => (
                <>
                  <span className="text-base">{getNavIcon(item.path)}</span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Admin-only link — labelled clearly */}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span className="text-base">🔐</span>
                  <span>Admin Dashboard</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600" />
                  )}
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-slate-200">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-slate-200"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: getAvatarColor(currentUser?.name) }}
              >
                {getInitials(currentUser?.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                {currentUser?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-[240px] min-h-screen">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function getNavIcon(path) {
  const icons = {
    "/dashboard": "📊",
    "/trips":     "✈️",
    "/trips/new": "➕",
    "/profile":   "👤",
  };
  return icons[path] ?? "•";
}
