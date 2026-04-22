const bcrypt = require("bcrypt");
const { RegisterUserCommand, RegisterUserHandler } = require("../../src/commands/user/register-user.handler");
const { LoginUserCommand, LoginUserHandler } = require("../../src/commands/user/login-user.handler");
const { GetProfileQuery, GetProfileHandler } = require("../../src/queries/user/get-profile.handler");

// Mock prisma
jest.mock("../../src/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require("../../src/lib/prisma");

describe("User Commands and Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("RegisterUserCommand", () => {
    test("creates a command with email and password", () => {
      const command = new RegisterUserCommand("test@test.com", "password123");

      expect(command.email).toBe("test@test.com");
      expect(command.password).toBe("password123");
    });
  });

  describe("RegisterUserHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new RegisterUserHandler();
    });

    test("throws if email is missing", async () => {
      const command = new RegisterUserCommand(null, "123456");

      await expect(handler.handle(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is missing", async () => {
      const command = new RegisterUserCommand("test@test.com", null);

      await expect(handler.handle(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is too short", async () => {
      const command = new RegisterUserCommand("test@test.com", "12345");

      await expect(handler.handle(command))
        .rejects.toThrow("Password must be at least 6 characters");
    });

    test("throws if user already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: "test@test.com" });

      const command = new RegisterUserCommand("test@test.com", "password123");

      await expect(handler.handle(command))
        .rejects.toThrow("User already exists");
    });

    test("creates a new user successfully", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: "new@test.com",
        passwordHash: "hashed",
      });

      const command = new RegisterUserCommand("new@test.com", "securePass123");
      const result = await handler.handle(command);

      expect(result).toEqual({ id: 1, email: "new@test.com" });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("LoginUserCommand", () => {
    test("creates a command with email and password", () => {
      const command = new LoginUserCommand("test@test.com", "password123");

      expect(command.email).toBe("test@test.com");
      expect(command.password).toBe("password123");
    });
  });

  describe("LoginUserHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new LoginUserHandler("test_secret");
    });

    test("throws if email is missing", async () => {
      const command = new LoginUserCommand(null, "pass123");

      await expect(handler.handle(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is missing", async () => {
      const command = new LoginUserCommand("test@test.com", null);

      await expect(handler.handle(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const command = new LoginUserCommand("notfound@test.com", "pass123");

      await expect(handler.handle(command))
        .rejects.toThrow("Invalid credentials");
    });

    test("throws if password is invalid", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash: hashedPassword,
      });

      const command = new LoginUserCommand("test@test.com", "wrongpassword");

      await expect(handler.handle(command))
        .rejects.toThrow("Invalid credentials");
    });

    test("returns token and user when credentials are valid", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash: hashedPassword,
      });

      const command = new LoginUserCommand("test@test.com", "correctPassword");
      const result = await handler.handle(command);

      expect(result.user).toEqual(expect.objectContaining({ id: 1, email: "test@test.com" }));
      expect(result.token).toBeDefined();
    });

    test("uses custom JWT secret", async () => {
      const customSecret = "custom_secret_key";
      const customHandler = new LoginUserHandler(customSecret);
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash: hashedPassword,
      });

      const command = new LoginUserCommand("test@test.com", "correctPassword");
      const result = await customHandler.handle(command);

      expect(result.token).toBeDefined();
    });
  });

  describe("GetProfileQuery", () => {
    test("creates a query with user id", () => {
      const query = new GetProfileQuery(1);

      expect(query.userId).toBe(1);
    });

    test("converts string id to number", () => {
      const query = new GetProfileQuery("123");

      expect(query.userId).toBe(123);
      expect(typeof query.userId).toBe("number");
    });
  });

  describe("GetProfileHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new GetProfileHandler();
    });

    test("throws if userId is missing", async () => {
      const query = new GetProfileQuery(null);

      await expect(handler.handle(query))
        .rejects.toThrow("User id is required");
    });

    test("throws if user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const query = new GetProfileQuery(999);

      await expect(handler.handle(query))
        .rejects.toThrow("User not found");
    });

    test("returns user DTO when user is found", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "user@test.com",
        passwordHash: "hashed",
      });

      const query = new GetProfileQuery(1);
      const result = await handler.handle(query);

      expect(result).toEqual({ id: 1, email: "user@test.com" });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});