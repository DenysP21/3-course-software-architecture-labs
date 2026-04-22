const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class LoginUserCommand {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

class LoginUserHandler {
  constructor(userRepository, jwtSecret = process.env.JWT_SECRET || "fallback_secret") {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  async execute(command) {
    if (!command.email || !command.password) {
      throw new Error("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(command.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
    );

    return { token, user };
  }
}

module.exports = { LoginUserCommand, LoginUserHandler };