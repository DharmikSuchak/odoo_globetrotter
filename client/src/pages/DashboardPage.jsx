import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data } = await axios.get("/api/trips");
        // Only show up to 3 recent trips on the dashboard
        setTrips(data.trips.slice(0, 3));
      } catch (err) {
        console.error(err);
        setError("Failed to load recent trips.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">
          Welcome back, {currentUser?.name.split(" ")[0]}!
        </h1>
        <p className="text-slate-500 mt-1">Ready for your next adventure?</p>
      </header>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-xl text-slate-800">Recent Trips</h2>
          <Link to="/trips" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            View all &rarr;
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white border border-slate-100 rounded-2xl shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link 
                key={trip.id} 
                to={`/trips/${trip.id}`}
                className="group block bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-10 w-10 bg-sky-50 rounded-full flex items-center justify-center mb-4 text-xl">
                  ✈️
                </div>
                <h3 className="font-semibold text-lg text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {trip.name}
                </h3>
                {trip.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{trip.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
                  <span className="text-sky-600">Open builder &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-display font-semibold text-lg text-slate-800 mb-2">No trips yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Start planning your dream vacation. Add destinations, build an itinerary, and keep track of your budget.
            </p>
            <Link 
              to="/trips/new"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-sky-600 text-white font-medium hover:bg-sky-700 hover:shadow-md hover:shadow-sky-600/20 transition-all duration-200"
            >
              Plan New Trip
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
