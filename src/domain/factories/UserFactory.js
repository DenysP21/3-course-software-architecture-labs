const User = require("../models/User");
const { UserValidationError } = require("../errors/userErrors");

class UserFactory {
  static create({ email, passwordHash }) {
    if (!email || !passwordHash) {
      throw new UserValidationError("Email and password hash are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UserValidationError("Invalid email format");
    }

    return new User({
      email,
      passwordHash,
    });
  }
}

module.exports = UserFactory;
