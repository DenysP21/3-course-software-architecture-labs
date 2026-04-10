const request = require("supertest");
const app = require("../../src/app");
const prisma = require("../../src/lib/prisma");

describe("User API Integration Tests", () => {
  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test("POST /users/register should create a new user", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "newuser@example.com", password: "password123" });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("newuser@example.com");
  });

  test("POST /users/register should return 409 for duplicate email", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "newuser@example.com", password: "password123" });
    
    expect(res.statusCode).toBe(409);
  });

  test("POST /users/login should return token for valid credentials", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "newuser@example.com", password: "password123" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("newuser@example.com");
  });

  test("POST /users/login should return 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "newuser@example.com", password: "wrongpassword" });
    
    expect(res.statusCode).toBe(401);
  });

  test("GET /users/profile should return user profile with valid token", async () => {
    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: "newuser@example.com", password: "password123" });
    
    const token = loginRes.body.token;

    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("newuser@example.com");
  });
});