const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserValidationError } = require("../../../domain/errors/userErrors");

class LoginUserCommand {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class LoginUserHandler {
  constructor(repo) {
    this.userRepository = repo;
  }

  async handle(command) {
    if (!command.email || !command.password) {
      throw new UserValidationError("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UserValidationError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      command.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UserValidationError("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
    );

    return { token, user };
  }
}

module.exports = { LoginUserCommand, LoginUserHandler };
