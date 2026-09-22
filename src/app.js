const express = require("express");
const apiKeyAuth = require("./middleware/auth");
const tasksRouter = require("./routes/tasks");
const healthRouter = require("./routes/health");

const app = express();
app.use(express.json());

// Health/metrics endpoints are intentionally NOT behind auth so the Jenkins
// pipeline's Monitoring stage (and any external monitoring tool) can reach
// them without needing a credential.
app.use("/", healthRouter);

// All task endpoints require a valid x-api-key header.
app.use("/tasks", apiKeyAuth, tasksRouter);

app.get("/", (req, res) => {
  res.json({
    service: "taskmanager-api",
    message: "See /health for status, /metrics for Prometheus metrics, and /tasks for the Task API.",
  });
});

// Only start listening if this file is run directly (not when required by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`taskmanager-api listening on port ${PORT}`);
  });
}

module.exports = app;
