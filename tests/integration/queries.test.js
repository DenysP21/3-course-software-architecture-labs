const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/infrastructure/database/prisma");

describe("Query Handlers Integration Tests", () => {
  let token;
  let userId;
  let testTaskId;

  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const res = await request(app)
      .post("/users/register")
      .send({ email: "querytest@example.com", password: "password123" });

    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "querytest@example.com", password: "password123" });

    token = loginRes.body.token;
    userId = loginRes.body.user.id;

    const task = await prisma.task.create({
      data: {
        title: "Test Query Task",
        description: "This is a test task for GET queries",
        userId: userId,
      },
    });
    testTaskId = task.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /tasks (GetTasksHandler)", () => {
    test("Should return a list of mapped tasks for the user", async () => {
      const res = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("title", "Test Query Task");
      expect(res.body[0]).toHaveProperty("description");
      expect(res.body[0]).toHaveProperty("status", "PENDING");
      expect(res.body[0]).not.toHaveProperty("createdAt");
    });

    test("Should return 401 if unauthorized", async () => {
      const res = await request(app).get("/tasks");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /tasks/:id (GetTaskByIdHandler)", () => {
    test("Should return a specific task mapped to DTO", async () => {
      const res = await request(app)
        .get(`/tasks/${testTaskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(testTaskId);
      expect(res.body.title).toBe("Test Query Task");
      expect(res.body).not.toHaveProperty("updatedAt");
    });

    test("Should return 404 if task does not exist", async () => {
      const res = await request(app)
        .get("/tasks/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });
});
