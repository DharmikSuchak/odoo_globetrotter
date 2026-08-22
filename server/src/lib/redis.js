const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  // Silence reconnect noise in tests; still retries on real failures
  lazyConnect: false,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  // Log but don't crash — rate limiting degrades gracefully if Redis is down
  console.error("Redis error:", err.message);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

module.exports = redis;
