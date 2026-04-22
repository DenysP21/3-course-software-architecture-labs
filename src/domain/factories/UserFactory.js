const User = require("../models/User");
const { ValidationError, UserExistsError } = require("../errors/userErrors");

class UserFactory {
  static async create({ email, passwordHash }, userRepository) {
    if (!email || !passwordHash) {
      throw new ValidationError("Email and password hash are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (userRepository) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserExistsError(`User with email ${email} already exists`);
      }
    }

    return new User({
      email,
      passwordHash,
    });
  }
}

module.exports = UserFactory;
