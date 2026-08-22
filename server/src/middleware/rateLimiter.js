const redis = require("../lib/redis");

/**
 * Factory that returns an Express middleware enforcing a sliding-window
 * rate limit stored in Redis.
 *
 * @param {object} options
 * @param {string}  options.keyPrefix   - Redis key namespace (e.g. "rl:login")
 * @param {number}  options.maxAttempts - Max requests allowed in the window
 * @param {number}  options.windowSecs  - Rolling window size in seconds
 */
function createRateLimiter({ keyPrefix, maxAttempts, windowSecs }) {
  return async function rateLimiter(req, res, next) {
    // Key by IP so limits are per-client, not global
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const redisKey = `${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(redisKey);

      // Set expiry only on the first request in a window
      if (current === 1) {
        await redis.expire(redisKey, windowSecs);
      }

      if (current > maxAttempts) {
        const ttl = await redis.ttl(redisKey);
        return res.status(429).json({
          success: false,
          message: `Too many attempts. Please try again in ${ttl} second${ttl !== 1 ? "s" : ""}.`,
          retryAfterSeconds: ttl,
        });
      }

      next();
    } catch (redisErr) {
      // If Redis is down, allow the request through rather than blocking all users
      console.error("Rate limiter Redis error — allowing request:", redisErr.message);
      next();
    }
  };
}

module.exports = { createRateLimiter };
