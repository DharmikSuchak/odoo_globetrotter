const express = require("express");
const prisma = require("../lib/prisma");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// ── GET /api/trips/:id/health ─────────────────────────────────────────────────
router.get("/:id/health", async (req, res) => {
  try {
    const tripId = req.params.id;
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: { include: { activities: true } } }
    });

    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    let score = 100;
    const recommendations = [];
    let totalSpent = 0;
    const activitiesByDay = {};
    const hoursByDay = {};

    trip.stops.forEach((stop, sIdx) => {
      stop.activities.forEach(act => {
        const day = act.day || 1;
        const dayKey = `Stop ${sIdx + 1} - Day ${day}`;
        totalSpent += act.cost || 0;
        
        if (!activitiesByDay[dayKey]) activitiesByDay[dayKey] = 0;
        activitiesByDay[dayKey]++;
        
        if (!hoursByDay[dayKey]) hoursByDay[dayKey] = 0;
        hoursByDay[dayKey] += act.durationHours || 1;
      });
    });

    // Budget Rule
    if (trip.budget && trip.budget > 0) {
      if (totalSpent > trip.budget) {
        score -= 20;
        recommendations.push("You are over budget. Consider removing or swapping expensive activities.");
      } else if (totalSpent > trip.budget * 0.9) {
        score -= 5;
        recommendations.push("You are very close to your budget limit.");
      }
    }

    // Pacing & Density Rules
    Object.entries(activitiesByDay).forEach(([dayKey, count]) => {
      if (count > 4) {
        score -= 10;
        recommendations.push(`${dayKey} has too many activities (${count}). Consider moving one to a lighter day.`);
      }
    });

    Object.entries(hoursByDay).forEach(([dayKey, hours]) => {
      if (hours > 10) {
        score -= 15;
        recommendations.push(`${dayKey} is overloaded with ${hours} hours of activities. Ensure you leave time for rest and travel.`);
      }
    });

    if (trip.stops.length > 0 && Object.keys(activitiesByDay).length === 0) {
      score -= 30;
      recommendations.push("Your itinerary is empty. Try adding some activities or use the AI Generate tool!");
    }

    score = Math.max(0, score); // Ensure score doesn't drop below 0

    res.json({ success: true, health: { score, recommendations } });
  } catch (err) {
    console.error("GET /api/trips/:id/health error:", err);
    res.status(500).json({ success: false, message: "Failed to compute trip health" });
  }
});

// ── POST /api/trips/:id/ai-generate ───────────────────────────────────────────
router.post("/:id/ai-generate", async (req, res) => {
  try {
    const tripId = req.params.id;
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "Gemini API key is not configured." });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: { include: { city: true } } }
    });

    if (trip.stops.length === 0) {
      return res.status(400).json({ success: false, message: "Add at least one stop before generating an itinerary." });
    }

    // Get all catalog activities
    const catalog = await prisma.activity.findMany({
      where: { stopId: null },
      select: { id: true, name: true, category: true, cost: true, durationHours: true }
    });

    const prompt = `
      I am planning a trip with a budget of $${trip.budget || 'flexible'}.
      Here are the stops:
      ${trip.stops.map(s => `- Stop ID: ${s.id} in ${s.city.name} (${s.city.country})`).join("\n")}
      
      Here is the catalog of available activities in JSON format:
      ${JSON.stringify(catalog)}

      Your task: Create a balanced itinerary for these stops. 
      Select activities ONLY from the provided catalog. Do NOT invent activities.
      Provide 2-3 activities per day for each stop. Assume each stop lasts 2 days for this demo.
      
      You must return ONLY a raw JSON array (no markdown code blocks, no text before or after).
      The array must contain objects with exactly these keys:
      "stopId" (the ID of the stop), "day" (the day number 1 or 2), and "catalogActivityId" (the ID of the catalog activity).
      Example: [{"stopId":"...", "day":1, "catalogActivityId":"..."}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawJson = response.text;
    if (rawJson.includes("```json")) {
      rawJson = rawJson.split("```json")[1].split("```")[0].trim();
    } else if (rawJson.includes("```")) {
      rawJson = rawJson.split("```")[1].split("```")[0].trim();
    }

    let suggestions;
    try {
      suggestions = JSON.parse(rawJson.trim());
    } catch (e) {
      return res.status(500).json({ success: false, message: "AI returned malformed JSON.", raw: rawJson });
    }

    // Apply suggestions to the database (clone catalog activities)
    const createdActivities = [];
    for (const item of suggestions) {
      const catalogItem = catalog.find(c => c.id === item.catalogActivityId);
      if (catalogItem && trip.stops.some(s => s.id === item.stopId)) {
        const newAct = await prisma.activity.create({
          data: {
            stopId: item.stopId,
            name: catalogItem.name,
            category: catalogItem.category,
            cost: catalogItem.cost,
            durationHours: catalogItem.durationHours,
            day: item.day
          }
        });
        createdActivities.push(newAct);
      }
    }

    res.json({ success: true, message: `Generated ${createdActivities.length} activities.` });
  } catch (err) {
    console.error("POST /ai-generate error:", err);
    res.status(500).json({ success: false, message: "AI Generation failed." });
  }
});

// ── POST /api/trips/:id/ai-optimize ───────────────────────────────────────────
router.post("/:id/ai-optimize", async (req, res) => {
  try {
    const tripId = req.params.id;
    const { warnings } = req.body; // Pass the warnings from the frontend health check
    
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "Gemini API key is not configured." });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: { include: { activities: true, city: true } } }
    });

    const prompt = `
      You are an AI travel assistant. We need to optimize an itinerary.
      
      Here is the current itinerary state (JSON):
      ${JSON.stringify(trip.stops, null, 2)}
      
      Here are the health warnings from our system:
      ${JSON.stringify(warnings || [])}

      Your task: Suggest exactly ONE action to improve this itinerary based on the warnings.
      If there are too many activities on one day, move one to a lighter day.
      
      Return ONLY a raw JSON object (no markdown, no text) with exactly these keys:
      "action" (should be "move"), 
      "activityId" (the ID of the activity to move), 
      "newDay" (the integer day number to move it to), 
      "reason" (a short sentence explaining why to the user).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawJson = response.text;
    if (rawJson.includes("```json")) {
      rawJson = rawJson.split("```json")[1].split("```")[0].trim();
    } else if (rawJson.includes("```")) {
      rawJson = rawJson.split("```")[1].split("```")[0].trim();
    }

    let suggestion;
    try {
      suggestion = JSON.parse(rawJson.trim());
    } catch (e) {
      return res.status(500).json({ success: false, message: "AI returned malformed JSON.", raw: rawJson });
    }

    res.json({ success: true, suggestion });
  } catch (err) {
    console.error("POST /ai-optimize error:", err);
    res.status(500).json({ success: false, message: "AI Optimization failed." });
  }
});

const crypto = require("crypto");

// ── PUT /api/trips/:id/share ──────────────────────────────────────────────────
router.put("/:id/share", async (req, res) => {
  try {
    const tripId = req.params.id;
    const { isPublic } = req.body;
    
    const check = await verifyTripOwnership(tripId, req.user.userId);
    if (check.error) return res.status(check.status).json({ success: false, message: check.error });

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    
    let shareSlug = trip.shareSlug;
    // Generate a slug if we're making it public and it doesn't have one
    if (isPublic && !shareSlug) {
      shareSlug = crypto.randomBytes(4).toString("hex") + "-" + Date.now().toString(36).slice(-4);
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: { isPublic, shareSlug }
    });

    res.json({ success: true, isPublic: updated.isPublic, shareSlug: updated.shareSlug });
  } catch (err) {
    console.error("PUT /api/trips/:id/share error:", err);
    res.status(500).json({ success: false, message: "Failed to update sharing settings" });
  }
});

// ── POST /api/trips/copy/:slug ────────────────────────────────────────────────
router.post("/copy/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const targetUserId = req.user.userId;

    // Find the public trip
    const sourceTrip = await prisma.trip.findUnique({
      where: { shareSlug: slug },
      include: {
        stops: {
          include: { activities: true }
        }
      }
    });

    if (!sourceTrip || !sourceTrip.isPublic) {
      return res.status(404).json({ success: false, message: "Trip not found or not public." });
    }

    // Create a new trip for the current user
    const newTrip = await prisma.trip.create({
      data: {
        userId: targetUserId,
        name: `Copy of ${sourceTrip.name}`,
        description: sourceTrip.description,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        budget: sourceTrip.budget,
        isPublic: false
      }
    });

    // Deep clone stops and activities
    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.stop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.cityId,
          startDate: stop.startDate,
          endDate: stop.endDate,
          order: stop.order
        }
      });

      const activitiesToCreate = stop.activities.map(act => ({
        stopId: newStop.id,
        name: act.name,
        category: act.category,
        cost: act.cost,
        durationHours: act.durationHours,
        day: act.day,
        description: act.description
      }));

      if (activitiesToCreate.length > 0) {
        await prisma.activity.createMany({ data: activitiesToCreate });
      }
    }

    res.json({ success: true, tripId: newTrip.id, message: "Trip copied successfully!" });
  } catch (err) {
    console.error("POST /api/trips/copy/:slug error:", err);
    res.status(500).json({ success: false, message: "Failed to copy trip" });
  }
});

module.exports = router;
