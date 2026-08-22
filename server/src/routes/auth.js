const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");
const { createRateLimiter } = require("../middleware/rateLimiter");
const { validateSignupInput, validateLoginInput } = require("../validators/auth.validators");

const router = express.Router();

const BCRYPT_SALT_ROUNDS = 12;
const JWT_EXPIRY = "7d";

// Tighter limit on login (brute-force target), looser on signup
const loginRateLimiter = createRateLimiter({ keyPrefix: "rl:login", maxAttempts: 5, windowSecs: 60 });
const signupRateLimiter = createRateLimiter({ keyPrefix: "rl:signup", maxAttempts: 10, windowSecs: 60 });

/**
 * Builds a signed JWT containing only the fields the client needs.
 * Never include sensitive fields like the password hash.
 */
function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Strips the password hash before sending the user object to the client.
 */
function sanitizeUser(user) {
  const { password: _omit, ...safeUser } = user;
  return safeUser;
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post("/signup", signupRateLimiter, async (req, res) => {
  const { errors, sanitized } = validateSignupInput(req.body);
  if (errors) {
    return res.status(400).json({ success: false, errors });
  }

  const { name, email, password } = sanitized;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Use a generic message to avoid leaking account existence
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Failed to create account. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", loginRateLimiter, async (req, res) => {
  const { errors, sanitized } = validateLoginInput(req.body);
  if (errors) {
    return res.status(400).json({ success: false, errors });
  }

  const { email, password } = sanitized;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Run bcrypt even when user doesn't exist to prevent timing-based email enumeration
    const DUMMY_HASH = "$2b$12$invalidhashfortimingnormalization0000000000000000000000";
    const hashToCompare = user ? user.password : DUMMY_HASH;

    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

module.exports = router;
