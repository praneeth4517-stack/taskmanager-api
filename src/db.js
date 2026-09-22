// Simple in-memory data store for the Task Manager API.
// Kept intentionally dependency-free (no native modules) so it builds
// cleanly in any CI environment, including a bare Jenkins/Windows agent.

let tasks = [];
let nextId = 1;

function reset() {
  tasks = [];
  nextId = 1;
}

function getAll() {
  return tasks;
}

function getById(id) {
  return tasks.find((t) => t.id === id);
}

function create({ title, description = "", completed = false }) {
  const task = {
    id: nextId++,
    title,
    description,
    completed,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

function update(id, updates) {
  const task = getById(id);
  if (!task) return null;
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  return task;
}

function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = { reset, getAll, getById, create, update, remove };
