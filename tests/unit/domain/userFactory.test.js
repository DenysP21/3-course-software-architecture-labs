const UserFactory = require("../../../src/domain/factories/UserFactory");
const {
  UserValidationError,
} = require("../../../src/domain/errors/userErrors");

describe("UserFactory Unit Tests (Pure Domain)", () => {
  test("Should throw UserValidationError for invalid email", () => {
    expect(() => {
      UserFactory.create({ email: "bad-email", passwordHash: "hash" });
    }).toThrow(UserValidationError);
  });

  test("Should create a valid User entity", () => {
    const user = UserFactory.create({
      email: "new@test.com",
      passwordHash: "hash123",
    });

    expect(user.email).toBe("new@test.com");
    expect(user.passwordHash).toBe("hash123");
  });
});
