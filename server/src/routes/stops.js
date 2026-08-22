const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── Helper: Verify stop ownership via its parent trip ───────────────────────
async function verifyStopOwnership(stopId, userId) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: { select: { userId: true } } },
  });
  if (!stop) return { error: "Stop not found", status: 404 };
  if (stop.trip.userId !== userId) return { error: "Forbidden", status: 403 };
  return { error: null, stop };
}

// ── DELETE /api/stops/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const stopId = req.params.id;

    const check = await verifyStopOwnership(stopId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    await prisma.stop.delete({ where: { id: stopId } });
    
    res.json({ success: true, message: "Stop deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/stops/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete stop" });
  }
});

// ── POST /api/stops/:id/activities ────────────────────────────────────────────
// Adds an activity to a stop. Can be cloned from catalog or entirely custom.
router.post("/:id/activities", async (req, res) => {
  try {
    const stopId = req.params.id;
    const { 
      catalogActivityId, // Optional: if provided, we clone this catalog item
      name, 
      category, 
      cost, 
      durationHours, 
      day, 
      description 
    } = req.body;

    const check = await verifyStopOwnership(stopId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    let activityData = {};

    if (catalogActivityId) {
      // Clone from catalog
      const catalogItem = await prisma.activity.findUnique({ where: { id: catalogActivityId } });
      if (!catalogItem) {
        return res.status(404).json({ success: false, message: "Catalog activity not found" });
      }
      
      activityData = {
        stopId,
        name: catalogItem.name,
        category: catalogItem.category,
        cost: catalogItem.cost,
        durationHours: catalogItem.durationHours,
        description: catalogItem.description,
        imageUrl: catalogItem.imageUrl,
        day: day ? parseInt(day, 10) : 1, // Default to day 1
      };
    } else {
      // Custom activity
      if (!name || !category) {
        return res.status(400).json({ success: false, message: "Name and category are required for custom activities" });
      }
      activityData = {
        stopId,
        name: name.trim(),
        category,
        cost: cost ? parseFloat(cost) : 0,
        durationHours: durationHours ? parseFloat(durationHours) : 1,
        description: description?.trim() || null,
        day: day ? parseInt(day, 10) : 1,
      };
    }

    const newActivity = await prisma.activity.create({
      data: activityData
    });

    res.status(201).json({ success: true, activity: newActivity });
  } catch (err) {
    console.error("POST /api/stops/:id/activities error:", err);
    res.status(500).json({ success: false, message: "Failed to add activity to stop" });
  }
});

module.exports = router;
