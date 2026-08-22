const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── GET /api/activities ───────────────────────────────────────────────────────
// Fetches catalog activities (stopId is null). Supports ?category= and ?search=
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Base filter: only catalog items
    let whereClause = { stopId: null };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search && search.trim() !== "") {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      take: 50,
    });

    res.json({ success: true, activities });
  } catch (err) {
    console.error("GET /api/activities error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch catalog activities" });
  }
});

// ── DELETE /api/activities/:id ────────────────────────────────────────────────
// Deletes a specific activity from a stop (requires ownership check)
router.delete("/:id", async (req, res) => {
  try {
    const activityId = req.params.id;

    // Verify ownership by walking up the relation: Activity -> Stop -> Trip -> User
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        stop: {
          include: {
            trip: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    if (!activity.stop) {
      // It's a catalog activity. We shouldn't allow deleting catalog items via this route.
      return res.status(403).json({ success: false, message: "Cannot delete global catalog activities" });
    }

    if (activity.stop.trip.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.activity.delete({ where: { id: activityId } });
    
    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/activities/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete activity" });
  }
});

module.exports = router;
