const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

// Integration tests: exercise the app through real HTTP requests
// (this is what the pipeline's "integration" part of the Test stage runs).
describe("Task API (integration)", () => {
  const API_KEY = process.env.API_KEY || "dev-local-key";

  beforeEach(() => {
    db.reset();
  });

  test("GET /health returns UP", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
  });

  test("GET /metrics returns Prometheus-format text", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.text).toContain("health_check_requests_total");
  });

  test("GET /tasks without an API key is rejected", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(401);
  });

  test("full CRUD lifecycle through the HTTP API", async () => {
    // Create
    const createRes = await request(app)
      .post("/tasks")
      .set("x-api-key", API_KEY)
      .send({ title: "Integration test task", description: "created via supertest" });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body.id;

    // Read (list)
    const listRes = await request(app).get("/tasks").set("x-api-key", API_KEY);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    // Read (single)
    const getRes = await request(app).get(`/tasks/${taskId}`).set("x-api-key", API_KEY);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe("Integration test task");

    // Update
    const updateRes = await request(app)
      .put(`/tasks/${taskId}`)
      .set("x-api-key", API_KEY)
      .send({ completed: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);

    // Delete
    const deleteRes = await request(app).delete(`/tasks/${taskId}`).set("x-api-key", API_KEY);
    expect(deleteRes.status).toBe(204);

    // Confirm gone
    const getAfterDelete = await request(app).get(`/tasks/${taskId}`).set("x-api-key", API_KEY);
    expect(getAfterDelete.status).toBe(404);
  });

  test("POST /tasks without a title is rejected with 400", async () => {
    const res = await request(app).post("/tasks").set("x-api-key", API_KEY).send({});
    expect(res.status).toBe(400);
  });
});
