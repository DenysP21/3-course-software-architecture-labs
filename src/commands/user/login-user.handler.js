const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const { toUserDTO } = require("../../dto/user.dto");

class LoginUserCommand {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class LoginUserHandler {
  constructor(jwtSecret = process.env.JWT_SECRET || "fallback_secret") {
    this.jwtSecret = jwtSecret;
  }

  async handle(command) {
    if (!command.email || !command.password) {
      throw new Error("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email: command.email }
    });
    
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

    return { 
      token, 
      user: toUserDTO(user) 
    };
  }
}

module.exports = { LoginUserCommand, LoginUserHandler };