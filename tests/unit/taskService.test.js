const userService = require("../../src/services/userService");
const userRepository = require("../../src/repositories/userRepository");

jest.mock("../../src/repositories/userRepository");

describe("User Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should throw error if password is less than 6 characters", async () => {
    await expect(userService.register("test@test.com", "12345"))
      .rejects.toThrow("Password must be at least 6 characters");
  });

  test("Should throw error if user already exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: "test@test.com" });

    await expect(userService.register("test@test.com", "password123"))
      .rejects.toThrow("User already exists");
  });

  test("Should throw error if password is incorrect", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      passwordHash: "hashedpassword"
    });

    await expect(userService.login("test@test.com", "wrongpassword"))
      .rejects.toThrow("Invalid credentials");
  });

  test("Should register user with valid data", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 1, email: "new@test.com" });

    const result = await userService.register("new@test.com", "securePass123");

    expect(result.email).toBe("new@test.com");
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });
});