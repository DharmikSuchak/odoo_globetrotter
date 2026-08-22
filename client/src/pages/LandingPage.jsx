import { useEffect, useState } from "react";
import axios from "axios";

// ── Destination data for the animated cards ───────────────────────────────────
const destinations = [
  { city: "Paris", country: "France", emoji: "🗼", cost: "₹₹₹", tag: "Romance" },
  { city: "Kyoto", country: "Japan", emoji: "⛩️", cost: "₹₹₹", tag: "Culture" },
  { city: "Bali", country: "Indonesia", emoji: "🌊", cost: "₹", tag: "Adventure" },
  { city: "Cape Town", country: "S. Africa", emoji: "🏔️", cost: "₹₹", tag: "Nature" },
  { city: "Istanbul", country: "Turkey", emoji: "🕌", cost: "₹₹", tag: "History" },
  { city: "Bangkok", country: "Thailand", emoji: "🛺", cost: "₹", tag: "Food" },
];

const features = [
  {
    icon: "🗺️",
    title: "Smart Itinerary Builder",
    desc: "Drag-and-drop days, add stops across multiple cities, and let AI fill the gaps.",
  },
  {
    icon: "💰",
    title: "Live Budget Tracker",
    desc: "Real-time cost breakdown per city, category, and day — no surprises.",
  },
  {
    icon: "🤖",
    title: "AI Travel Optimizer",
    desc: "Gemini-powered suggestions to reorder stops, find hidden gems, and save money.",
  },
  {
    icon: "📊",
    title: "Trip Health Score",
    desc: "A composite score rating balance, budget efficiency, and itinerary coverage.",
  },
  {
    icon: "🔗",
    title: "Share Your Journey",
    desc: "Generate a public link so friends can view or clone your itinerary.",
  },
  {
    icon: "📅",
    title: "Calendar Timeline",
    desc: "Visual day-by-day view of your entire trip with activity blocks.",
  },
];

// ── Status badge component ────────────────────────────────────────────────────
function ApiStatusBadge() {
  const [status, setStatus] = useState("checking"); // checking | online | offline
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios
      .get("/api/health")
      .then((res) => {
        setStatus("online");
        setMsg(res.data.message);
      })
      .catch(() => {
        setStatus("offline");
        setMsg("API unreachable");
      });
  }, []);

  const colors = {
    checking: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    online: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    offline: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  const dots = {
    checking: "bg-yellow-400 animate-pulse",
    online: "bg-emerald-400 online",
    offline: "bg-red-400",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[status]}`}
    >
      <span className={`status-dot ${dots[status]}`} />
      {status === "checking" ? "Checking API..." : msg || status}
    </div>
  );
}

// ── Destination card ──────────────────────────────────────────────────────────
function DestinationCard({ city, country, emoji, cost, tag, delay }) {
  return (
    <div
      className="glass-card p-4 cursor-pointer group hover:border-brand-500/30 hover:shadow-glow-sm transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animation: `fadeUp 0.6s ease-out ${delay}ms forwards` }}
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1">{tag}</p>
      <h3 className="text-white font-semibold font-display text-lg leading-tight">{city}</h3>
      <p className="text-white/50 text-sm">{country}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-white/40 text-xs">Cost</span>
        <span className="text-ocean-400 text-sm font-semibold">{cost}</span>
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className="glass-card p-6 group hover:border-brand-500/30 hover:translate-y-[-4px] transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, opacity: 0, animation: `fadeUp 0.6s ease-out ${delay}ms forwards` }}
    >
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-white font-semibold font-display text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-gradient overflow-x-hidden">
      {/* ── Decorative blobs ──────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-ocean-600/15 blur-[120px] animate-pulse-slow animation-delay-800" />
        <div className="absolute bottom-[-5%] left-[30%] w-[400px] h-[400px] rounded-full bg-coral-500/10 blur-[100px] animate-pulse-slow animation-delay-400" />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">🌍</span>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Globe<span className="gradient-text">Trotter</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ApiStatusBadge />
          <button id="nav-login-btn" className="btn-ghost text-sm py-2 px-4">
            Log in
          </button>
          <button id="nav-signup-btn" className="btn-primary text-sm py-2 px-4">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 100ms forwards" }}
        >
          <span>✨</span>
          <span>Powered by Google Gemini AI</span>
        </div>

        <h1
          className="font-display font-extrabold text-5xl md:text-7xl leading-[1.1] mb-6 text-white"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 200ms forwards" }}
        >
          Plan Trips That
          <br />
          <span className="gradient-text">Feel Effortless</span>
        </h1>

        <p
          className="text-white/60 text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 350ms forwards" }}
        >
          Build day-by-day itineraries, track budgets in real time, and let AI
          optimize your journey — from first stop to last sunset.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 500ms forwards" }}
        >
          <button id="hero-cta-primary" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
            🚀 Start Planning Free
          </button>
          <button id="hero-cta-demo" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto">
            🎬 Watch Demo
          </button>
        </div>

        {/* Stats row */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-12"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 650ms forwards" }}
        >
          {[
            { label: "Cities in catalog", value: "18+" },
            { label: "Activity templates", value: "38+" },
            { label: "AI powered", value: "100%" },
            { label: "Free to start", value: "Always" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-3xl text-white">{s.value}</p>
              <p className="text-white/40 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Destination cards ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2
            className="font-display font-bold text-3xl md:text-4xl text-white mb-3"
            style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 200ms forwards" }}
          >
            Explore Popular Destinations
          </h2>
          <p className="text-white/50" style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 350ms forwards" }}>
            From budget backpacking to luxury escapes — curated for every traveller
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((d, i) => (
            <DestinationCard key={d.city} {...d} delay={100 + i * 80} />
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2
            className="font-display font-bold text-3xl md:text-4xl text-white mb-3"
            style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 200ms forwards" }}
          >
            Everything You Need
          </h2>
          <p className="text-white/50" style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 350ms forwards" }}>
            One app to plan, budget, share, and optimize every trip
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={100 + i * 100} />
          ))}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div
          className="glass-card p-12 text-center border-brand-500/20"
          style={{ opacity: 0, animation: "fadeUp 0.6s ease-out 200ms forwards" }}
        >
          <span className="text-5xl mb-4 block animate-float">🌍</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Join thousands of travellers building smarter, more memorable journeys with GlobeTrotter.
          </p>
          <button id="cta-bottom-btn" className="btn-primary text-lg px-10 py-4">
            ✈️ Create Your First Trip
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span className="font-display font-semibold text-white/50">GlobeTrotter</span>
            <span>·</span>
            <span>Hackathon MVP 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Built with React + Vite + Tailwind</span>
            <span>·</span>
            <span>API: Express + Prisma + PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
