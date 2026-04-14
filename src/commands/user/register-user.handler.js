const bcrypt = require("bcrypt");

async function registerUser({ email, password }, userRepository) {
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
}

module.exports = { registerUser };