const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── GET /api/cities ───────────────────────────────────────────────────────────
// Fetches cities from the catalog. Supports optional ?search= parameter.
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search && search.trim() !== "") {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const cities = await prisma.city.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      take: 50, // limit results
    });

    res.json({ success: true, cities });
  } catch (err) {
    console.error("GET /api/cities error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch cities" });
  }
});

module.exports = router;
