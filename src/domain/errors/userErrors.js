const DomainError = require("./DomainError");

class UserExistsError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class UserValidationError extends DomainError {
  constructor(message) {
    super(message);
  }
}

module.exports = { UserExistsError, UserValidationError };
