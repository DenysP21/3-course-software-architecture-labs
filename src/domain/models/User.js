const { ValidationError } = require("../errors/DomainError");

class User {
  constructor({ id, email, passwordHash, createdAt }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date();
  }

  updateEmail(newEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      throw new ValidationError("Invalid email format");
    }
    this.email = newEmail;
  }

  updatePassword(newPasswordHash) {
    if (!newPasswordHash) {
      throw new ValidationError("Password hash cannot be empty");
    }
    this.passwordHash = newPasswordHash;
  }
}

module.exports = User;
