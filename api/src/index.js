require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const db = require("./config/database");
const redis = require("./config/redis");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middlewares ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    await redis.ping();
    res.json({ status: "ok", postgres: "up", redis: "up" });
  } catch (err) {
    res.status(503).json({ status: "degraded", error: err.message });
  }
});

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Boot ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
});

module.exports = app;
