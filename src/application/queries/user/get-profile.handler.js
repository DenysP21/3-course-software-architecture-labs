const prisma = require("../../../infrastructure/database/prisma");
const { toUserDTO } = require("../../../presentation/dto/user.dto");

class GetProfileQuery {
  constructor(userId) {
    this.userId = Number(userId);
  }
}

class GetProfileHandler {
  async handle(query) {
    if (!query.userId) {
      throw new Error("User id is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: query.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return toUserDTO(user);
  }
}

module.exports = { GetProfileQuery, GetProfileHandler };
