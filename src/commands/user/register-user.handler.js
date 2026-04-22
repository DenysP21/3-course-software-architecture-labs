const bcrypt = require("bcrypt");
const prisma = require("../../lib/prisma");
const { toUserDTO } = require("../../dto/user.dto");

class RegisterUserCommand {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

class RegisterUserHandler {
  async handle(command) {
    if (!command.email || !command.password) {
      throw new Error("Email and password are required");
    }

    if (command.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await prisma.user.findUnique({
      where: { email: command.email }
    });
    
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(command.password, 10);
    const user = await prisma.user.create({
      data: { 
        email: command.email, 
        passwordHash 
      }
    });

    return toUserDTO(user);
  }
}

module.exports = { RegisterUserCommand, RegisterUserHandler };