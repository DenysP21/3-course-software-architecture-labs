const User = require('../../domain/models/User');

class UserMapper {
  static toDomainModel(rawUser) {
    if (!rawUser) return null;

    return new User({
      id: rawUser.id,
      email: rawUser.email,
      passwordHash: rawUser.passwordHash,
      createdAt: rawUser.createdAt,
    });
  }
}

module.exports = UserMapper;
