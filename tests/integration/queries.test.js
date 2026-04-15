const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/lib/prisma");

describe("Task Queries Integration Tests (CQS)", () => {
  let testUser;
  let testToken;
  let testTask;

  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: { email: "queryuser@test.com", passwordHash: "hashedpass" },
    });

    testTask = await prisma.task.create({
      data: {
        title: "Test CQS Task",
        description: "Checking if queries work",
        userId: testUser.id,
      },
    });

    const jwt = require("jsonwebtoken");
    testToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || "fallback_secret",
    );
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test("GET /tasks should return list of tasks (Read Model)", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);

    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title", "Test CQS Task");
    expect(res.body[0]).toHaveProperty(
      "description",
      "Checking if queries work",
    );
  });

  test("GET /tasks/:id should return specific task details", async () => {
    const res = await request(app)
      .get(`/tasks/${testTask.id}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testTask.id);
    expect(res.body.title).toBe("Test CQS Task");
  });

  test("GET /tasks/:id should return 404 for unknown task", async () => {
    const res = await request(app)
      .get("/tasks/9999")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.statusCode).toBe(404);
  });
});
