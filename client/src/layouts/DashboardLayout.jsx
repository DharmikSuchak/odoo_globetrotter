import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Trips", path: "/trips", icon: "✈️" },
    { name: "Create Trip", path: "/trips/new", icon: "➕" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* ── Fixed Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-[240px] fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">
              Globe<span className="text-sky-600">Trotter</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sky-50 text-sky-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600"></span>}
              </Link>
            );
          })}
          {currentUser?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span>📊</span>
              Admin Analytics
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-full hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen relative">
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
