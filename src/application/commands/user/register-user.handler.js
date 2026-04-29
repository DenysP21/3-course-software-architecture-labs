const bcrypt = require("bcrypt");
const UserFactory = require("../../../domain/factories/UserFactory");
const {
  UserValidationError,
  UserExistsError,
} = require("../../../domain/errors/userErrors");
const NotificationService = require("../../../modules/notifications/notification.service");

class RegisterUserCommand {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class RegisterUserHandler {
  constructor(repo) {
    this.userRepository = repo;
    this.notificationService = new NotificationService();
  }

  async handle(command) {
    if (!command.email || !command.password) {
      throw new UserValidationError("Email and password are required");
    }
    if (command.password.length < 6) {
      throw new UserValidationError("Password must be at least 6 characters");
    }

    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserExistsError("User already exists");
    }

    const passwordHash = await bcrypt.hash(command.password, 10);
    const user = UserFactory.create(
      { email: command.email, passwordHash },
      this.userRepository,
    );

    const createdUser = await this.userRepository.create(user);

    await this.notificationService.sendWelcomeEmail(command.email);

    return createdUser;
  }
}

module.exports = { RegisterUserCommand, RegisterUserHandler };
