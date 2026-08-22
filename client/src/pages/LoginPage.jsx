import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  }

  function validateLocally() {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Enter a valid email address";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const localErrors = validateLocally();
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const secs = err.response.data.retryAfterSeconds;
        setServerError(`Too many attempts. Try again in ${secs} seconds.`);
      } else if (status === 401 || status === 400) {
        setServerError(err.response?.data?.message || "Invalid email or password");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center px-4 relative overflow-hidden">
      {/* ── Animated background blobs ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[512px] h-[512px] rounded-full bg-purple-600/30 blur-[128px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[512px] h-[512px] rounded-full bg-pink-600/25 blur-[128px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[128px] animate-pulse [animation-delay:3s]" />
      </div>

      {/* ── Glass card ────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl">🌍</span>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              Globe<span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Trotter</span>
            </span>
          </Link>
          <p className="mt-2 text-white/50 text-sm font-sans">Sign in to your account</p>
        </div>

        <div
          className="rounded-3xl border p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.18)",
          }}
        >
          {/* Hero title */}
          <h1 className="font-display font-extrabold text-4xl text-center mb-2">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-center text-white/50 text-sm mb-8">Your next adventure is one login away</p>

          {/* Server-level error banner */}
          {serverError && (
            <div
              id="login-error-banner"
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl px-4 py-3 text-sm font-sans bg-white/10 text-white placeholder-white/30
                  border transition-all duration-200 outline-none
                  focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  ${fieldErrors.email ? "border-red-500/60" : "border-white/20"}`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl pl-4 pr-12 py-3 text-sm font-sans bg-white/10 text-white placeholder-white/30
                    border transition-all duration-200 outline-none
                    focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                    ${fieldErrors.password ? "border-red-500/60" : "border-white/20"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 hover:text-white focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600
                hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
