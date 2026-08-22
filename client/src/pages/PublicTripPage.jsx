import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function PublicTripPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    fetchPublicTrip();
  }, [slug]);

  async function fetchPublicTrip() {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/public/trips/${slug}`);
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
      setError("This trip doesn't exist or is not public.");
    } finally {
      setLoading(false);
    }
  }

  async function copyTrip() {
    if (!token) return navigate("/login");
    try {
      setIsCopying(true);
      const { data } = await axios.post(`/api/trips/copy/${slug}`);
      navigate(`/trips/${data.tripId}`);
    } catch (err) {
      alert("Failed to copy trip. Please try again.");
      setIsCopying(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-500 animate-pulse">Loading amazing trip...</div>;
  if (error || !trip) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">
              Globe<span className="text-sky-500">Trotter</span>
            </span>
          </div>
          <div>
            {user ? (
              <button 
                onClick={copyTrip}
                disabled={isCopying}
                className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isCopying ? "Copying..." : "Copy this trip to my account"}
              </button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
              >
                Log in to copy trip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <h1 className="font-display font-extrabold text-5xl text-slate-800 mb-4">{trip.name}</h1>
          {trip.description && <p className="text-lg text-slate-500 max-w-2xl mx-auto">{trip.description}</p>}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-medium border border-sky-100">
            <span>By {trip.creatorName}</span>
          </div>
        </div>

        {trip.stops.length === 0 ? (
          <div className="text-center p-10 text-slate-500 bg-white rounded-3xl border border-slate-200">
            This trip has no destinations planned yet.
          </div>
        ) : (
          <div className="space-y-10">
            {trip.stops.map((stop, sIdx) => {
              // Group activities by day for display
              const days = {};
              stop.activities.forEach(act => {
                const d = act.day || 1;
                if (!days[d]) days[d] = [];
                days[d].push(act);
              });

              return (
                <div key={stop.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-display font-bold text-xl">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-2xl text-slate-800">{stop.city.name}</h2>
                      <p className="text-slate-500">{stop.city.country}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {Object.keys(days).length === 0 ? (
                      <p className="text-slate-400 italic">No specific activities planned.</p>
                    ) : (
                      <div className="space-y-8">
                        {Object.keys(days).sort().map(dayNum => (
                          <div key={dayNum} className="relative pl-6">
                            <div className="absolute left-0 top-2 bottom-[-2rem] w-px bg-slate-200"></div>
                            <div className="absolute left-[-3px] top-2.5 w-2 h-2 rounded-full bg-sky-400"></div>
                            <h3 className="font-semibold text-slate-700 mb-4 text-lg">Day {dayNum}</h3>
                            <div className="space-y-3">
                              {days[dayNum].map(act => (
                                <div key={act.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between group hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                  <div>
                                    <p className="font-medium text-slate-800">{act.name}</p>
                                    {act.description && <p className="text-sm text-slate-500 mt-1">{act.description}</p>}
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                                      {act.category}
                                    </span>
                                    <p className="text-xs font-medium text-slate-500 mt-2">{act.durationHours} hrs</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
