const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /tasks - list all tasks
router.get("/", (req, res) => {
  res.json(db.getAll());
});

// GET /tasks/:id - get a single task
router.get("/:id", (req, res) => {
  const task = db.getById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /tasks - create a task
router.post("/", (req, res) => {
  const { title, description, completed } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required and must be a string" });
  }
  const task = db.create({ title, description, completed });
  res.status(201).json(task);
});

// PUT /tasks/:id - update a task
router.put("/:id", (req, res) => {
  const updated = db.update(Number(req.params.id), req.body || {});
  if (!updated) return res.status(404).json({ error: "Task not found" });
  res.json(updated);
});

// DELETE /tasks/:id - delete a task
router.delete("/:id", (req, res) => {
  const removed = db.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

module.exports = router;
