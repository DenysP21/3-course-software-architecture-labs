const {
  RegisterUserCommand,
  RegisterUserHandler,
} = require("../../src/application/commands/user/register-user.handler");
const {
  LoginUserCommand,
  LoginUserHandler,
} = require("../../src/application/commands/user/login-user.handler");
const {
  GetProfileQuery,
  GetProfileHandler,
} = require("../../src/application/queries/user/get-profile.handler");
const bcrypt = require("bcrypt");

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

jest.mock("../../src/infrastructure/database/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const prisma = require("../../src/infrastructure/database/prisma");

describe("User Commands and Queries", () => {
  let registerHandler, loginHandler, getProfileHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    registerHandler = new RegisterUserHandler(mockUserRepository);
    loginHandler = new LoginUserHandler(mockUserRepository);
    getProfileHandler = new GetProfileHandler();
  });

  describe("RegisterUserHandler", () => {
    test("Should throw error if email is missing", async () => {
      const command = new RegisterUserCommand(null, "password123");

      await expect(registerHandler.handle(command)).rejects.toThrow(
        "Email and password are required",
      );
    });

    test("Should throw error if password is missing", async () => {
      const command = new RegisterUserCommand("test@test.com", null);

      await expect(registerHandler.handle(command)).rejects.toThrow(
        "Email and password are required",
      );
    });

    test("Should throw error if password is less than 6 characters", async () => {
      const command = new RegisterUserCommand("test@test.com", "12345");

      await expect(registerHandler.handle(command)).rejects.toThrow(
        "Password must be at least 6 characters",
      );
    });

    test("Should throw error if user already exists", async () => {
      const command = new RegisterUserCommand(
        "existing@test.com",
        "password123",
      );
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "existing@test.com",
      });

      await expect(registerHandler.handle(command)).rejects.toThrow(
        "User already exists",
      );
    });

    test("Should register user successfully", async () => {
      const command = new RegisterUserCommand("new@test.com", "password123");
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        email: "new@test.com",
        passwordHash: "hashedpassword",
      });

      const result = await registerHandler.handle(command);

      expect(result.id).toBe(1);
      expect(result.email).toBe("new@test.com");
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("LoginUserHandler", () => {
    test("Should throw error if email is missing", async () => {
      const command = new LoginUserCommand(null, "password123");

      await expect(loginHandler.handle(command)).rejects.toThrow(
        "Email and password are required",
      );
    });

    test("Should throw error if password is missing", async () => {
      const command = new LoginUserCommand("test@test.com", null);

      await expect(loginHandler.handle(command)).rejects.toThrow(
        "Email and password are required",
      );
    });

    test("Should throw error if user not found", async () => {
      const command = new LoginUserCommand("notfound@test.com", "password123");
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginHandler.handle(command)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    test("Should throw error if password is incorrect", async () => {
      const command = new LoginUserCommand("test@test.com", "wrongpassword");
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash:
          "$2b$10$KIXxPfxr...incorrectHash",
      });

      await expect(loginHandler.handle(command)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    test("Should login user successfully and return token", async () => {
      const command = new LoginUserCommand("test@test.com", "password123");
      const hashedPassword = await bcrypt.hash("password123", 10);

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash: hashedPassword,
      });

      const result = await loginHandler.handle(command);

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe("test@test.com");
    });
  });

  describe("GetProfileHandler", () => {
    test("Should throw error if userId is missing", async () => {
      const query = new GetProfileQuery(null);

      await expect(getProfileHandler.handle(query)).rejects.toThrow(
        "User id is required",
      );
    });

    test("Should throw error if user not found", async () => {
      const query = new GetProfileQuery(999);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(getProfileHandler.handle(query)).rejects.toThrow(
        "User not found",
      );
    });

    test("Should return user profile as DTO", async () => {
      const query = new GetProfileQuery(1);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        passwordHash: "hashedpassword",
      });

      const result = await getProfileHandler.handle(query);

      expect(result.id).toBe(1);
      expect(result.email).toBe("test@test.com");
      expect(result.passwordHash).toBeUndefined(); // DTO не містить хеша
    });

    test("Should convert userId to number", async () => {
      const query = new GetProfileQuery("5");
      expect(query.userId).toBe(5);
    });
  });
});
