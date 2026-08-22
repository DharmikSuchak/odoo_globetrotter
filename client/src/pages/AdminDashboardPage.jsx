import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/analytics");
      setAnalytics(data.analytics);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Forbidden: You do not have admin access.");
      } else {
        setError("Failed to load admin analytics.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-slate-500 animate-pulse">Loading admin data...</div>;
  if (error || !analytics) return <div className="text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>;

  const PIE_COLORS = ['#0ea5e9', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and analytics</p>
      </header>

      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
          <p className="font-display font-bold text-4xl text-slate-800">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Trips</p>
          <p className="font-display font-bold text-4xl text-slate-800">{analytics.totalTrips}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Shared Trips</p>
          <p className="font-display font-bold text-4xl text-sky-600">{analytics.sharedTrips}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Average Trip Budget</p>
          <p className="font-display font-bold text-4xl text-slate-800">${analytics.avgBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Cities */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-display font-bold text-lg text-slate-800 mb-6">Most Popular Cities</h2>
          {analytics.popularCities.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.popularCities} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 italic py-10 text-center">No stop data available.</p>
          )}
        </div>

        {/* Popular Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-display font-bold text-lg text-slate-800 mb-6">Activity Categories</h2>
          {analytics.popularCategories.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.popularCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {analytics.popularCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 italic py-10 text-center">No activity data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
