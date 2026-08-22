const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── GET /api/public/trips/:slug ───────────────────────────────────────────────
router.get("/trips/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { shareSlug: slug },
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
        },
        user: {
          select: { name: true } // Only expose the creator's name
        }
      }
    });

    if (!trip || !trip.isPublic) {
      return res.status(404).json({ success: false, message: "Trip not found or is private." });
    }

    // Return safe data
    const safeTrip = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      creatorName: trip.user.name,
      stops: trip.stops
    };

    res.json({ success: true, trip: safeTrip });
  } catch (err) {
    console.error("GET /api/public/trips/:slug error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch public trip" });
  }
});

module.exports = router;
