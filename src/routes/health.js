const express = require("express");
const client = require("prom-client");

const router = express.Router();

// Collect default Node.js process metrics (memory, CPU, event loop, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// A custom counter that tracks how many times the health check has been hit.
// Useful as a simple "meaningful metric" beyond the default process stats.
const healthCheckCounter = new client.Counter({
  name: "health_check_requests_total",
  help: "Total number of times /health has been requested",
  registers: [register],
});

const startTime = Date.now();

// GET /health - liveness/readiness probe used by the pipeline's Monitoring stage
router.get("/health", (req, res) => {
  healthCheckCounter.inc();
  res.status(200).json({
    status: "UP",
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

// GET /metrics - Prometheus-format metrics endpoint
router.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
