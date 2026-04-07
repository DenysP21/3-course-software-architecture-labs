const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/lib/prisma");
const userService = require("../../src/services/userService");

describe("Task API Integration Tests", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const email = "test@example.com";
    const password = "password123";

    await userService.register(email, password);
    const loginData = await userService.login(email, password);

    token = loginData.token;
    userId = loginData.user.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test("POST /tasks should create task in database", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Integration Task",
        description: "DB Check"
      });

    expect(res.statusCode).toBe(201);
    
    const taskInDb = await prisma.task.findUnique({
      where: { id: res.body.id }
    });

    expect(taskInDb).not.toBeNull();
    expect(taskInDb.title).toBe("Integration Task");
    expect(taskInDb.userId).toBe(userId);
  });

  test("POST /tasks should return 401 without token", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Unauthorized"
      });

    expect(res.statusCode).toBe(401);
  });

  test("GET /tasks should return user tasks", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});