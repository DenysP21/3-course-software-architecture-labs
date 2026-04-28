const UserService = require("../../src/application/services/userService");
const userRepository = require("../../src/infrastructure/repositories/userRepository");
const { UserValidationError, UserExistsError } = require("../../src/domain/errors/userErrors");

jest.mock("../../src/infrastructure/repositories/userRepository");

describe("User Service Unit Tests", () => {
  let userService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(userRepository);
  });

  test("Should throw UserValidationError if password is less than 6 characters", async () => {
    await expect(userService.register("test@test.com", "12345"))
      .rejects.toThrow(UserValidationError);
  });

  test("Should throw UserExistsError if user already exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com" });

    await expect(userService.register("test@test.com", "password123"))
      .rejects.toThrow(UserExistsError);
  });

  test("Should throw UserValidationError if password is incorrect", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      passwordHash: "hashedpassword"
    });

    await expect(userService.login("test@test.com", "wrongpassword"))
      .rejects.toThrow(UserValidationError);
  });

  test("Should register user with valid data", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1, email: "new@test.com" });

    const result = await userService.register("new@test.com", "securePass123");

    expect(result.email).toBe("new@test.com");
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });

  test("Should throw UserValidationError if email or password missing on register", async () => {
    await expect(userService.register(null, "123456"))
      .rejects.toThrow(UserValidationError);
  });

  test("Should throw error if email or password missing on login", async () => {
    await expect(userService.login("test@test.com", null))
      .rejects.toThrow("Email and password are required");
  });

  test("Should throw error if user not found on login", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(userService.login("notfound@test.com", "pass123"))
      .rejects.toThrow("Invalid credentials");
  });

  test("Should get user by id", async () => {
    userRepository.findById.mockResolvedValue({ id: 1, email: "user@test.com" });
    const user = await userService.getUserById(1);
    expect(user.id).toBe(1);
    expect(user.email).toBe("user@test.com");
  });
});