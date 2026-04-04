const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userService = {
  async register(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return await userRepository.create({ email, passwordHash });
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    return { token, user: { id: user.id, email: user.email } };
  },

  async getUserById(id) {
    return await userRepository.findById(id);
  },
};

module.exports = userService;