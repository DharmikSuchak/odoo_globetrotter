import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function TripBuilderPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // City Search State
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [searchingCities, setSearchingCities] = useState(false);

  // Activity Search State (per stop, but kept simple here: single active modal/drawer approach could be better, 
  // but we'll inline it for speed)
  const [activeStopId, setActiveStopId] = useState(null);
  const [activityQuery, setActivityQuery] = useState("");
  const [activityResults, setActivityResults] = useState([]);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  async function fetchTrip() {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/trips/${id}`);
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
      setError("Failed to load trip details.");
    } finally {
      setLoading(false);
    }
  }

  // ── Cities ──────────────────────────────────────────────────────────────────
  async function searchCities(e) {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    try {
      setSearchingCities(true);
      const { data } = await axios.get(`/api/cities?search=${encodeURIComponent(cityQuery)}`);
      setCityResults(data.cities);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCities(false);
    }
  }

  async function addStop(cityId) {
    try {
      await axios.post(`/api/trips/${id}/stops`, { cityId });
      setCityQuery("");
      setCityResults([]);
      fetchTrip(); // Reload to get the new stop
    } catch (err) {
      console.error(err);
      alert("Failed to add stop");
    }
  }

  async function deleteStop(stopId) {
    if (!window.confirm("Delete this stop and all its activities?")) return;
    try {
      await axios.delete(`/api/stops/${stopId}`);
      fetchTrip();
    } catch (err) {
      console.error(err);
      alert("Failed to delete stop");
    }
  }

  // ── Activities ──────────────────────────────────────────────────────────────
  async function searchActivities(e) {
    e.preventDefault();
    if (!activityQuery.trim()) return;
    try {
      const { data } = await axios.get(`/api/activities?search=${encodeURIComponent(activityQuery)}`);
      setActivityResults(data.activities);
    } catch (err) {
      console.error(err);
    }
  }

  async function addActivityToStop(catalogActivityId) {
    try {
      await axios.post(`/api/stops/${activeStopId}/activities`, { catalogActivityId });
      setActivityQuery("");
      setActivityResults([]);
      setActiveStopId(null);
      fetchTrip();
    } catch (err) {
      console.error(err);
      alert("Failed to add activity");
    }
  }

  async function deleteActivity(activityId) {
    if (!window.confirm("Remove this activity?")) return;
    try {
      await axios.delete(`/api/activities/${activityId}`);
      fetchTrip();
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity");
    }
  }

  if (loading) return <div className="text-slate-500 animate-pulse">Loading trip...</div>;
  if (error || !trip) return <div className="text-red-500">{error || "Trip not found"}</div>;

  return (
    <div>
      <header className="mb-8">
        <Link to="/trips" className="text-sm font-medium text-slate-400 hover:text-slate-600 mb-2 inline-block">
          &larr; Back to trips
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-800">{trip.name}</h1>
            <p className="text-slate-500 mt-1">{trip.description || "No description provided."}</p>
          </div>
          <div className="text-right text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <p><span className="font-medium text-slate-700">Budget:</span> ${trip.budget?.toLocaleString() || "N/A"}</p>
            <p><span className="font-medium text-slate-700">Dates:</span> {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBD'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'TBD'}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary (Stops & Activities) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-semibold text-xl text-slate-800 border-b border-slate-200 pb-2">Itinerary</h2>
          
          {trip.stops.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-300 rounded-2xl text-center bg-white text-slate-500">
              No stops added yet. Search for a city on the right to add your first stop!
            </div>
          ) : (
            trip.stops.map((stop, index) => (
              <div key={stop.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Stop Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {stop.city.name}, {stop.city.country}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-normal">
                          Cost Idx: {stop.city.costIndex}
                        </span>
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteStop(stop.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Activities List */}
                <div className="p-4 space-y-3">
                  {stop.activities.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No activities planned.</p>
                  ) : (
                    stop.activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-2"></span>
                            {act.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 pl-4">
                            {act.category} · {act.durationHours}h · ${act.cost}
                          </p>
                        </div>
                        <button onClick={() => deleteActivity(act.id)} className="text-slate-300 hover:text-red-500">
                          &times;
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add Activity Button/Form */}
                  <div className="pt-2">
                    {activeStopId === stop.id ? (
                      <div className="mt-2 p-3 border border-sky-200 bg-sky-50 rounded-xl">
                        <form onSubmit={searchActivities} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Search catalog for activities..."
                            value={activityQuery}
                            onChange={e => setActivityQuery(e.target.value)}
                            className="flex-1 rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:border-sky-500"
                          />
                          <button type="submit" className="px-3 py-1.5 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700">Search</button>
                          <button type="button" onClick={() => {setActiveStopId(null); setActivityResults([])}} className="px-2 text-slate-400">&times;</button>
                        </form>
                        
                        {activityResults.length > 0 && (
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                            {activityResults.map(res => (
                              <div key={res.id} className="flex items-center justify-between bg-white p-2 border border-slate-100 rounded-lg text-sm">
                                <div>
                                  <span className="font-medium">{res.name}</span> <span className="text-xs text-slate-400">({res.category})</span>
                                </div>
                                <button onClick={() => addActivityToStop(res.id)} className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-2 py-1 rounded">
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveStopId(stop.id)}
                        className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <span className="text-lg">+</span> Add Activity
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Search & Add Stops */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-8">
            <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Add Destination</h2>
            <form onSubmit={searchCities} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search cities (e.g. Paris)"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="flex-1 rounded-xl px-3 py-2 text-sm border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={searchingCities}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                Find
              </button>
            </form>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {cityResults.length === 0 && cityQuery !== "" && !searchingCities ? (
                <p className="text-sm text-slate-500 text-center py-4">No cities found.</p>
              ) : (
                cityResults.map(city => (
                  <div key={city.id} className="p-3 border border-slate-100 rounded-xl hover:border-sky-200 hover:bg-sky-50 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{city.name}</p>
                      <p className="text-xs text-slate-500">{city.country}</p>
                    </div>
                    <button
                      onClick={() => addStop(city.id)}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700 transition-all"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
