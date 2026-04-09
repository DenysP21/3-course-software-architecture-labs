const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return await this.userRepository.create({ email, passwordHash });
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
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
