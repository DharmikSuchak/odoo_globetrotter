const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the process to avoid
// exhausting the connection pool during hot-reloads in development.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

module.exports = prisma;
