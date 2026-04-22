const DomainError = require("./DomainError");

class InvalidTaskDateError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class TaskValidationError extends DomainError {
  constructor(message) {
    super(message);
  }
}

module.exports = { InvalidTaskDateError, TaskValidationError };
