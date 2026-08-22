const jwt = require("jsonwebtoken");

/**
 * Express middleware that verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to `req.user` on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // Distinguish expired tokens from truly invalid ones for better DX
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired, please log in again" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = requireAuth;
