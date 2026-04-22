const bcrypt = require("bcrypt");

class RegisterUserCommand {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

class RegisterUserHandler {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(command) {
    if (!command.email || !command.password) {
      throw new Error("Email and password are required");
    }

    if (command.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(command.password, 10);
    return await this.userRepository.create({ email: command.email, passwordHash });
  }
}

module.exports = { RegisterUserCommand, RegisterUserHandler };