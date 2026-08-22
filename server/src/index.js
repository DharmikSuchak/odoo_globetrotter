require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const tripsRouter = require("./routes/trips");
const stopsRouter = require("./routes/stops");
const citiesRouter = require("./routes/cities");
const activitiesRouter = require("./routes/activities");
const publicRouter = require("./routes/public");
const adminRouter = require("./routes/admin");

const requireAuth = require("./middleware/requireAuth");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Public routes ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "GlobeTrotter API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);

// ── Protected routes ──────────────────────────────────────────────────────────
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.use("/api/trips", requireAuth, tripsRouter);
app.use("/api/stops", requireAuth, stopsRouter);
app.use("/api/cities", requireAuth, citiesRouter);
app.use("/api/activities", requireAuth, activitiesRouter);
app.use("/api/admin", adminRouter); // requireAuth is applied inside adminRouter or we can just let adminRouter handle it

// ── Fallbacks ─────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "GlobeTrotter API. See /api/health." });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — must be last and have four params
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 GlobeTrotter API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
