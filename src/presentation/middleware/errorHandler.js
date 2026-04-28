const DomainError = require("../../domain/errors/DomainError");
const { InvalidTaskDateError, TaskValidationError } = require("../../domain/errors/taskErrors");
const { UserExistsError, UserValidationError } = require("../../domain/errors/userErrors");

const errorHandler = (error, req, res, next) => {
  console.error(error);

  // Handle domain errors
  if (error instanceof DomainError) {
    let statusCode = 400; // Default for validation errors

    if (error instanceof UserExistsError) {
      statusCode = 409; // Conflict
    } else if (error instanceof UserValidationError || error instanceof TaskValidationError || error instanceof InvalidTaskDateError) {
      statusCode = 400; // Bad Request
    }

    return res.status(statusCode).json({ error: error.message });
  }

  // Handle errors with custom statusCode
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  // Handle other errors
  res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;