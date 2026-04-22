const UserFactory = require("../../../src/domain/factories/UserFactory");
const {
  ValidationError,
  UserExistsError,
} = require("../../../src/domain/errors/DomainError");

describe("UserFactory Unit Tests (Pure Domain)", () => {
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };
  });

  test("Should throw ValidationError for invalid email", async () => {
    await expect(
      UserFactory.create(
        { email: "bad-email", passwordHash: "hash" },
        mockUserRepository,
      ),
    ).rejects.toThrow(ValidationError);
  });

  test("Should throw UserExistsError if email is already taken", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: "test@test.com",
    });

    await expect(
      UserFactory.create(
        { email: "test@test.com", passwordHash: "hash" },
        mockUserRepository,
      ),
    ).rejects.toThrow(UserExistsError);
  });

  test("Should create a valid User entity", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const user = await UserFactory.create(
      { email: "new@test.com", passwordHash: "hash123" },
      mockUserRepository,
    );

    expect(user.email).toBe("new@test.com");
    expect(user.passwordHash).toBe("hash123");
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("new@test.com");
  });
});
