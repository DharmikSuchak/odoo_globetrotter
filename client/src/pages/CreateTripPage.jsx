import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Trip name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      const { data } = await axios.post("/api/trips", payload);
      
      // Redirect to the trip builder for the newly created trip
      navigate(`/trips/${data.trip.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create trip");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/trips" className="text-sm font-medium text-slate-400 hover:text-slate-600 mb-2 inline-block">
            &larr; Back to trips
          </Link>
          <h1 className="font-display font-bold text-3xl text-slate-800">Plan a New Trip</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Euro Trip 2026"
              className="w-full rounded-xl px-4 py-2.5 text-sm font-sans bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-sans bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-sans bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1.5">
              Total Budget (USD)
            </label>
            <input
              id="budget"
              name="budget"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className="w-full rounded-xl px-4 py-2.5 text-sm font-sans bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Description / Notes
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's the vibe?"
              className="w-full rounded-xl px-4 py-2.5 text-sm font-sans bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link 
            to="/trips"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Creating..." : "Create & Start Building"}
          </button>
        </div>
      </form>
    </div>
  );
}
