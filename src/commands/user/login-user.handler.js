const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function loginUser({ email, password }, userRepository, jwtSecret = process.env.JWT_SECRET || "fallback_secret") {
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
    jwtSecret,
  );

  return { token, user };
}

module.exports = { loginUser };