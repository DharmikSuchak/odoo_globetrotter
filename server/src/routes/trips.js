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

// ── GET /api/trips/:id/itinerary ──────────────────────────────────────────────
router.get("/:id/itinerary", async (req, res) => {
  try {
    const tripId = req.params.id;

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

    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    // Restructure into day-by-day
    const itinerary = [];
    
    trip.stops.forEach(stop => {
      // Find max day for this stop
      let maxDay = 1;
      stop.activities.forEach(act => {
        if (act.day > maxDay) maxDay = act.day;
      });

      // Initialize days for this stop
      for (let day = 1; day <= maxDay; day++) {
        itinerary.push({
          stopId: stop.id,
          city: stop.city,
          dayNumber: day,
          date: stop.startDate ? new Date(new Date(stop.startDate).getTime() + (day - 1) * 24 * 60 * 60 * 1000) : null,
          activities: stop.activities.filter(a => a.day === day || (!a.day && day === 1)) // Default missing day to day 1
        });
      }
    });

    res.json({ success: true, itinerary });
  } catch (err) {
    console.error("GET /api/trips/:id/itinerary error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch itinerary" });
  }
});

// ── GET /api/trips/:id/budget ─────────────────────────────────────────────────
router.get("/:id/budget", async (req, res) => {
  try {
    const tripId = req.params.id;

    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            activities: true
          }
        }
      }
    });

    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    const budget = trip.budget || 0;
    let totalSpent = 0;
    const spentByCategory = {};
    const spentByDay = {};

    // Calculate totals
    trip.stops.forEach((stop, stopIndex) => {
      stop.activities.forEach(act => {
        const cost = act.cost || 0;
        totalSpent += cost;
        
        // Category
        if (!spentByCategory[act.category]) spentByCategory[act.category] = 0;
        spentByCategory[act.category] += cost;

        // Day (we use a global day index to make it easier: Stop 1 Day 1, Stop 2 Day 1, etc.)
        const dayKey = `Stop ${stopIndex + 1} - Day ${act.day || 1}`;
        if (!spentByDay[dayKey]) spentByDay[dayKey] = 0;
        spentByDay[dayKey] += cost;
      });
    });

    // Determine warnings
    const warnings = [];
    const percentageUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
    
    if (budget > 0 && totalSpent > budget) {
      warnings.push({ type: "danger", message: `You are over budget by $${(totalSpent - budget).toLocaleString()}` });
    } else if (budget > 0 && percentageUsed > 90) {
      warnings.push({ type: "warning", message: "You are within 10% of your total budget." });
    }

    // Check for overloaded days (e.g. any single day takes up > 35% of total budget)
    if (budget > 0) {
      Object.entries(spentByDay).forEach(([dayKey, dayTotal]) => {
        if ((dayTotal / budget) > 0.35) {
          warnings.push({ type: "warning", message: `${dayKey} accounts for over 35% of your total budget.` });
        }
      });
    }

    // Format for recharts
    const categoryChartData = Object.entries(spentByCategory).map(([name, value]) => ({ name, value }));

    res.json({
      success: true,
      data: {
        budget,
        totalSpent,
        remaining: budget - totalSpent,
        percentageUsed,
        spentByCategory: categoryChartData,
        spentByDay,
        warnings
      }
    });
  } catch (err) {
    console.error("GET /api/trips/:id/budget error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch budget breakdown" });
  }
});

module.exports = router;
