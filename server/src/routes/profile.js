const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ── GET /api/profile ──────────────────────────────────────────────────────────
// Returns the current user's full profile (password excluded)
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, photoUrl: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// ── PUT /api/profile ──────────────────────────────────────────────────────────
// Updates name and/or photoUrl for the current user
router.put("/", async (req, res) => {
  try {
    const { name, photoUrl } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Name must be 100 characters or fewer" });
    }

    // Validate photoUrl format and size (base64 of a 2MB image is ~2.7MB)
    if (photoUrl !== undefined && photoUrl !== null && photoUrl !== "") {
      const isBase64 = typeof photoUrl === "string" && photoUrl.startsWith("data:image/");
      const isUrl = typeof photoUrl === "string" && /^https?:\/\//i.test(photoUrl);
      if (!isBase64 && !isUrl) {
        return res.status(400).json({ success: false, message: "Invalid photo format. Must be a data URI or HTTPS URL." });
      }
      // Guard against excessively large payloads (> 5MB encoded)
      if (Buffer.byteLength(photoUrl, "utf8") > 5 * 1024 * 1024) {
        return res.status(413).json({ success: false, message: "Photo is too large. Please use an image under 3MB." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name.trim(),
        // null explicitly clears the photo; undefined skips the field entirely
        photoUrl: photoUrl === null ? null : (photoUrl || undefined),
      },
      select: { id: true, name: true, email: true, role: true, photoUrl: true },
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

module.exports = router;
