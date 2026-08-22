import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ── Chart colours (sky-blue family + supporting palette) ─────────────────────
const CHART_COLORS = ["#0ea5e9", "#ec4899", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#64748b"];

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isAdmin
          ? "bg-indigo-100 text-indigo-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`font-display font-bold text-4xl ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}

// ── Skeleton loader matching a stat card ─────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
      <div className="h-9 bg-slate-200 rounded w-1/3" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]         = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview | users
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingUsers, setLoadingUsers]         = useState(false);
  const [analyticsError, setAnalyticsError]     = useState("");
  const [usersError, setUsersError]             = useState("");

  useEffect(() => { fetchAnalytics(); }, []);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) fetchUsers();
  }, [activeTab]);

  async function fetchAnalytics() {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError("");
      const { data } = await axios.get("/api/admin/analytics");
      setAnalytics(data.analytics);
    } catch (err) {
      if (err.response?.status === 403) {
        setAnalyticsError("Access denied. Admin role required.");
      } else {
        setAnalyticsError("Failed to load analytics. Please try again.");
      }
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      setUsersError("");
      const { data } = await axios.get("/api/admin/users");
      setUsers(data.users);
    } catch (err) {
      if (err.response?.status === 403) {
        setUsersError("Access denied. Admin role required.");
      } else {
        setUsersError("Failed to load user list. Please try again.");
      }
    } finally {
      setLoadingUsers(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and user management</p>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 mb-8 flex gap-6">
        {[
          { key: "overview", label: "Analytics Overview" },
          { key: "users",    label: "Manage Users" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Analytics Tab ────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <>
          {analyticsError && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-8 font-medium">
              {analyticsError}
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loadingAnalytics ? (
              [1,2,3,4].map(i => <StatCardSkeleton key={i} />)
            ) : analytics ? (
              <>
                <StatCard label="Total Users"          value={analytics.totalUsers} />
                <StatCard label="Total Trips"          value={analytics.totalTrips} />
                <StatCard label="Shared Trips"         value={analytics.sharedTrips} accent="text-sky-600" />
                <StatCard label="Avg. Trip Budget"     value={`$${analytics.avgBudget.toLocaleString()}`} />
              </>
            ) : null}
          </div>

          {/* Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Cities */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-display font-bold text-lg text-slate-800 mb-6">Most Popular Cities</h2>
                {analytics.popularCities.length > 0 ? (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.popularCities} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                        <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">🗺️</p>
                    <p className="text-slate-500 font-medium">No city data yet</p>
                    <p className="text-slate-400 text-sm mt-1">Cities will appear here once users start planning trips.</p>
                  </div>
                )}
              </div>

              {/* Activity Categories */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-display font-bold text-lg text-slate-800 mb-6">Activity Categories</h2>
                {analytics.popularCategories.length > 0 ? (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.popularCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="count">
                          {analytics.popularCategories.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-slate-500 font-medium">No activity data yet</p>
                    <p className="text-slate-400 text-sm mt-1">Categories will populate as users build itineraries.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Users Tab ────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <>
          {usersError && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-6 font-medium">
              {usersError}
              <button
                onClick={fetchUsers}
                className="ml-4 underline text-red-700 hover:no-underline font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingUsers ? (
              <div className="divide-y divide-slate-100">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="h-9 w-9 bg-slate-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded-full w-14" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">👥</p>
                <p className="font-display font-semibold text-lg text-slate-800 mb-1">No users yet</p>
                <p className="text-slate-500 text-sm">Registered accounts will appear here.</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-4">User</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Trips</div>
                  <div className="col-span-1">Joined</div>
                </div>
                {/* Table rows */}
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
                    >
                      {/* Avatar + name */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: getAvatarColor(user.name) }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-slate-800 truncate">{user.name}</span>
                      </div>
                      {/* Email */}
                      <div className="col-span-3 text-sm text-slate-500 truncate">{user.email}</div>
                      {/* Role badge */}
                      <div className="col-span-2"><RoleBadge role={user.role} /></div>
                      {/* Trip count */}
                      <div className="col-span-2 text-sm font-medium text-slate-700">{user.tripCount}</div>
                      {/* Join date */}
                      <div className="col-span-1 text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
                  {users.length} registered user{users.length !== 1 ? "s" : ""}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Avatar helpers (same as DashboardLayout) ──────────────────────────────────
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const palette = ["#0284c7", "#0369a1", "#0ea5e9", "#075985", "#0c4a6e"];
  if (!name) return palette[0];
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}
