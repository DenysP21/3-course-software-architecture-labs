const bcrypt = require("bcrypt");
const { registerUser } = require("../../src/commands/user/register-user.handler");
const { loginUser } = require("../../src/commands/user/login-user.handler");
const { getProfile } = require("../../src/queries/user/get-profile.handler");

describe("User command/query handlers", () => {
  let userRepository;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };
  });

  test("registerUser throws if email or password is missing", async () => {
    await expect(registerUser({ email: null, password: "123456" }, userRepository))
      .rejects.toThrow("Email and password are required");
  });

  test("registerUser throws if password is too short", async () => {
    await expect(registerUser({ email: "test@test.com", password: "12345" }, userRepository))
      .rejects.toThrow("Password must be at least 6 characters");
  });

  test("registerUser throws if user already exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com" });

    await expect(registerUser({ email: "test@test.com", password: "password123" }, userRepository))
      .rejects.toThrow("User already exists");
  });

  test("registerUser creates a new user", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1, email: "new@test.com" });

    const result = await registerUser({ email: "new@test.com", password: "securePass123" }, userRepository);

    expect(result).toEqual({ id: 1, email: "new@test.com" });
    expect(userRepository.create).toHaveBeenCalledTimes(1);
    expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email: "new@test.com" }));
  });

  test("loginUser throws if email or password is missing", async () => {
    await expect(loginUser({ email: "test@test.com", password: null }, userRepository))
      .rejects.toThrow("Email and password are required");
  });

  test("loginUser throws if user is not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUser({ email: "notfound@test.com", password: "pass123" }, userRepository))
      .rejects.toThrow("Invalid credentials");
  });

  test("loginUser throws if password is invalid", async () => {
    const hashedPassword = await bcrypt.hash("correctPassword", 10);
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com", passwordHash: hashedPassword });

    await expect(loginUser({ email: "test@test.com", password: "wrongpassword" }, userRepository))
      .rejects.toThrow("Invalid credentials");
  });

  test("loginUser returns token and user when credentials are valid", async () => {
    const hashedPassword = await bcrypt.hash("correctPassword", 10);
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com", passwordHash: hashedPassword });

    const result = await loginUser({ email: "test@test.com", password: "correctPassword" }, userRepository, "test_secret");

    expect(result.user).toEqual(expect.objectContaining({ id: 1, email: "test@test.com" }));
    expect(result.token).toBeDefined();
  });

  test("getProfile returns a user by id", async () => {
    userRepository.findById.mockResolvedValue({ id: 1, email: "user@test.com" });

    const user = await getProfile(1, userRepository);
    expect(user).toEqual({ id: 1, email: "user@test.com" });
  });
});