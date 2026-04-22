const bcrypt = require("bcrypt");
const { RegisterUserCommand, RegisterUserHandler } = require("../../src/commands/user/register-user.handler");
const { LoginUserCommand, LoginUserHandler } = require("../../src/commands/user/login-user.handler");
const { getProfile } = require("../../src/queries/user/get-profile.handler");

describe("User Commands and Handlers", () => {
  let userRepository;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
  });

  describe("RegisterUserCommand", () => {
    test("creates a command with email and password", () => {
      const command = new RegisterUserCommand({ email: "test@test.com", password: "password123" });
      
      expect(command.email).toBe("test@test.com");
      expect(command.password).toBe("password123");
    });
  });

  describe("RegisterUserHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new RegisterUserHandler(userRepository);
    });

    test("throws if email is missing", async () => {
      const command = new RegisterUserCommand({ email: null, password: "123456" });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is missing", async () => {
      const command = new RegisterUserCommand({ email: "test@test.com", password: null });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is too short", async () => {
      const command = new RegisterUserCommand({ email: "test@test.com", password: "12345" });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Password must be at least 6 characters");
    });

    test("throws if user already exists", async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com" });
      const command = new RegisterUserCommand({ email: "test@test.com", password: "password123" });

      await expect(handler.execute(command))
        .rejects.toThrow("User already exists");
    });

    test("creates a new user successfully", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 1, email: "new@test.com", passwordHash: "hashed" });

      const command = new RegisterUserCommand({ email: "new@test.com", password: "securePass123" });
      const result = await handler.execute(command);

      expect(result).toEqual({ id: 1, email: "new@test.com", passwordHash: "hashed" });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email: "new@test.com" }));
    });
  });

  describe("LoginUserCommand", () => {
    test("creates a command with email and password", () => {
      const command = new LoginUserCommand({ email: "test@test.com", password: "password123" });
      
      expect(command.email).toBe("test@test.com");
      expect(command.password).toBe("password123");
    });
  });

  describe("LoginUserHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new LoginUserHandler(userRepository, "test_secret");
    });

    test("throws if email is missing", async () => {
      const command = new LoginUserCommand({ email: null, password: "pass123" });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if password is missing", async () => {
      const command = new LoginUserCommand({ email: "test@test.com", password: null });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Email and password are required");
    });

    test("throws if user is not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const command = new LoginUserCommand({ email: "notfound@test.com", password: "pass123" });

      await expect(handler.execute(command))
        .rejects.toThrow("Invalid credentials");
    });

    test("throws if password is invalid", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      userRepository.findByEmail.mockResolvedValue({ 
        id: 1, 
        email: "test@test.com", 
        passwordHash: hashedPassword 
      });

      const command = new LoginUserCommand({ email: "test@test.com", password: "wrongpassword" });
      
      await expect(handler.execute(command))
        .rejects.toThrow("Invalid credentials");
    });

    test("returns token and user when credentials are valid", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      userRepository.findByEmail.mockResolvedValue({ 
        id: 1, 
        email: "test@test.com", 
        passwordHash: hashedPassword 
      });

      const command = new LoginUserCommand({ email: "test@test.com", password: "correctPassword" });
      const result = await handler.execute(command);

      expect(result.user).toEqual(expect.objectContaining({ id: 1, email: "test@test.com" }));
      expect(result.token).toBeDefined();
    });

    test("uses custom JWT secret", async () => {
      const customSecret = "custom_secret_key";
      const customHandler = new LoginUserHandler(userRepository, customSecret);
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      userRepository.findByEmail.mockResolvedValue({ 
        id: 1, 
        email: "test@test.com", 
        passwordHash: hashedPassword 
      });

      const command = new LoginUserCommand({ email: "test@test.com", password: "correctPassword" });
      const result = await customHandler.execute(command);

      expect(result.token).toBeDefined();
    });
  });

  describe("getProfile query", () => {
    test("returns a user by id", async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: "user@test.com" });

      const user = await getProfile(1, userRepository);
      expect(user).toEqual({ id: 1, email: "user@test.com" });
    });
  });
});