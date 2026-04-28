const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserFactory = require("../../domain/factories/UserFactory");
const { UserValidationError } = require("../../domain/errors/userErrors");

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(email, password) {
    if (!email || !password) {
      throw new UserValidationError("Email and password are required");
    }
    if (password.length < 6) {
      throw new UserValidationError("Password must be at least 6 characters");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserFactory.create({ email, passwordHash }, this.userRepository);
    
    return await this.userRepository.create(user);
  }

  async login(email, password) {
    if (!email || !password) {
      throw new UserValidationError("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserValidationError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UserValidationError("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
    );

    return { token, user };
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }
}

module.exports = UserService;
