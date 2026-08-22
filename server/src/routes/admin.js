const express = require("express");
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// ── Middleware: Require Admin ─────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
  }
  next();
}

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
router.get("/analytics", requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const sharedTrips = await prisma.trip.count({ where: { isPublic: true } });
    
    const budgetAgg = await prisma.trip.aggregate({
      _avg: { budget: true },
      where: { budget: { gt: 0 } }
    });
    const avgBudget = budgetAgg._avg.budget || 0;

    // Popular Cities (by stop count)
    const cityCounts = await prisma.stop.groupBy({
      by: ['cityId'],
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 5
    });

    // Fetch actual city names
    const popularCities = await Promise.all(
      cityCounts.map(async (c) => {
        const city = await prisma.city.findUnique({ where: { id: c.cityId }, select: { name: true } });
        return { name: city.name, count: c._count.cityId };
      })
    );

    // Popular Activity Categories
    const categoryCounts = await prisma.activity.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { stopId: { not: null } }, // Only count planned activities, not global catalog items
      orderBy: { _count: { category: 'desc' } }
    });

    const popularCategories = categoryCounts.map(c => ({
      name: c.category,
      count: c._count.category
    }));

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalTrips,
        sharedTrips,
        avgBudget: Math.round(avgBudget),
        popularCities,
        popularCategories
      }
    });

  } catch (err) {
    console.error("GET /api/admin/analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

module.exports = router;
