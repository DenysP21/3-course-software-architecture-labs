const prisma = require("../database/prisma");

const userRepository = {
  async create(userData) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash,
      },
    });
  },

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },
};

module.exports = userRepository;
