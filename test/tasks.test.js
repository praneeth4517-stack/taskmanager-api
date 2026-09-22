const db = require("../src/db");

// Unit tests: exercise the data-layer logic directly, no HTTP involved.
describe("db (unit)", () => {
  beforeEach(() => {
    db.reset();
  });

  test("create() adds a task and assigns an incrementing id", () => {
    const t1 = db.create({ title: "Write report" });
    const t2 = db.create({ title: "Record demo video" });
    expect(t1.id).toBe(1);
    expect(t2.id).toBe(2);
    expect(db.getAll()).toHaveLength(2);
  });

  test("getById() returns the matching task", () => {
    const created = db.create({ title: "Test task" });
    const found = db.getById(created.id);
    expect(found).toEqual(created);
  });

  test("getById() returns undefined for a non-existent id", () => {
    expect(db.getById(999)).toBeUndefined();
  });

  test("update() merges fields and stamps updatedAt", () => {
    const created = db.create({ title: "Original" });
    const updated = db.update(created.id, { title: "Updated", completed: true });
    expect(updated.title).toBe("Updated");
    expect(updated.completed).toBe(true);
    expect(updated.updatedAt).toBeDefined();
  });

  test("update() returns null for a non-existent id", () => {
    expect(db.update(999, { title: "x" })).toBeNull();
  });

  test("remove() deletes the task and returns true", () => {
    const created = db.create({ title: "To delete" });
    expect(db.remove(created.id)).toBe(true);
    expect(db.getById(created.id)).toBeUndefined();
  });

  test("remove() returns false for a non-existent id", () => {
    expect(db.remove(999)).toBe(false);
  });
});
