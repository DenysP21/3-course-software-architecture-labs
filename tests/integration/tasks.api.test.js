const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/infrastructure/database/prisma");

describe("Task API Integration Tests", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const email = "test@example.com";
    const password = "password123";

    await request(app).post("/users/register").send({ email, password });
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email, password });

    token = loginRes.body.token;
    userId = loginRes.body.user.id;
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
        description: "DB Check",
      });

    expect(res.statusCode).toBe(201);

    const taskInDb = await prisma.task.findUnique({
      where: { id: res.body.id },
    });

    expect(taskInDb).not.toBeNull();
    expect(taskInDb.title).toBe("Integration Task");
    expect(taskInDb.userId).toBe(userId);
  });

  test("POST /tasks should return 401 without token", async () => {
    const res = await request(app).post("/tasks").send({
      title: "Unauthorized",
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

  test("GET /tasks/:id should return task if it belongs to user", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task for GET" });

    const taskId = createRes.body.id;

    const getRes = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.title).toBe("Task for GET");
  });

  test("PUT /tasks/:id should update existing task", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to Update" });

    const taskId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task Title" });

    expect(updateRes.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.title).toBe("Updated Task Title");
  });

  test("DELETE /tasks/:id should delete task", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task to Delete" });

    const taskId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(204);

    const getRes = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(404);
  });
});
