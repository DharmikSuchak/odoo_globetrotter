const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── Helper: Verify trip ownership ─────────────────────────────────────────────
async function verifyTripOwnership(tripId, userId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });
  if (!trip) return { error: "Trip not found", status: 404 };
  if (trip.userId !== userId) return { error: "Forbidden", status: 403 };
  return { error: null };
}

// ── GET /api/trips ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, trips });
  } catch (err) {
    console.error("GET /api/trips error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trips" });
  }
});

// ── POST /api/trips ───────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, startDate, endDate, description, budget } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Trip name is required" });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.userId,
        name: name.trim(),
        description: description?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
      },
    });

    res.status(201).json({ success: true, trip });
  } catch (err) {
    console.error("POST /api/trips error:", err);
    res.status(500).json({ success: false, message: "Failed to create trip" });
  }
});

// ── GET /api/trips/:id ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    
    // First find the trip to check ownership
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: [
                { day: 'asc' },
                { createdAt: 'asc' }
              ]
            }
          }
        }
      }
    });

    res.json({ success: true, trip });
  } catch (err) {
    console.error("GET /api/trips/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trip details" });
  }
});

// ── PUT /api/trips/:id ────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    const { name, startDate, endDate, description, budget } = req.body;

    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Trip name is required" });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
      },
    });

    res.json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.error("PUT /api/trips/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to update trip" });
  }
});

// ── DELETE /api/trips/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    await prisma.trip.delete({ where: { id: tripId } });
    
    res.json({ success: true, message: "Trip deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/trips/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete trip" });
  }
});

// ── POST /api/trips/:id/stops ─────────────────────────────────────────────────
router.post("/:id/stops", async (req, res) => {
  try {
    const tripId = req.params.id;
    const { cityId, startDate, endDate } = req.body;

    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    if (!cityId) {
      return res.status(400).json({ success: false, message: "cityId is required" });
    }

    // Determine the next order index
    const existingStops = await prisma.stop.count({ where: { tripId } });

    const newStop = await prisma.stop.create({
      data: {
        tripId,
        cityId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        order: existingStops, // append to the end
      },
      include: {
        city: true,
        activities: true
      }
    });

    res.status(201).json({ success: true, stop: newStop });
  } catch (err) {
    console.error("POST /api/trips/:id/stops error:", err);
    res.status(500).json({ success: false, message: "Failed to add stop to trip" });
  }
});

module.exports = router;
