import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/trips");
      setTrips(data.trips);
    } catch (err) {
      console.error(err);
      setError("Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tripId) {
    if (!window.confirm("Are you sure you want to delete this trip? All stops and activities will be lost.")) {
      return;
    }

    try {
      setDeletingId(tripId);
      await axios.delete(`/api/trips/${tripId}`);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">My Trips</h1>
          <p className="text-slate-500 mt-1">Manage all your upcoming and past adventures.</p>
        </div>
        <Link 
          to="/trips/new"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-sky-600 text-white font-medium hover:bg-sky-700 hover:shadow-md hover:shadow-sky-600/20 transition-all duration-200"
        >
          <span>➕</span> <span className="ml-2">Plan New Trip</span>
        </Link>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div 
              key={trip.id} 
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 bg-sky-50 rounded-full flex items-center justify-center text-2xl">
                  📍
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{trip.name}</h3>
                  <div className="text-sm text-slate-500 mt-0.5 flex gap-4">
                    <span>
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Dates TBD'}
                      {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                    </span>
                    {trip.budget && <span>Budget: ${trip.budget.toLocaleString()}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  to={`/trips/${trip.id}`}
                  className="px-4 py-2 text-sm font-medium text-sky-700 bg-sky-50 rounded-full hover:bg-sky-100 transition-colors"
                >
                  Edit / Build
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  disabled={deletingId === trip.id}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deletingId === trip.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">🧳</div>
          <h3 className="font-display font-semibold text-lg text-slate-800 mb-2">Your itinerary is empty</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            You don't have any trips planned yet. Click the button above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
