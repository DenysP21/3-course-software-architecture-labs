const prisma = require("../database/prisma");
const UserMapper = require("../mappers/UserMapper");

const userRepository = {
  async create(domainUser) {
    const rawUser = await prisma.user.create({
      data: UserMapper.toPersistence(domainUser),
    });
    return UserMapper.toDomainModel(rawUser);
  },

  async findByEmail(email) {
    const rawUser = await prisma.user.findUnique({
      where: { email },
    });
    return UserMapper.toDomainModel(rawUser);
  },

  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return UserMapper.toDomainModel(rawUser);
  },
};

module.exports = userRepository;