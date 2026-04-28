const DomainError = require("../../domain/errors/DomainError");
const { InvalidTaskDateError, TaskValidationError } = require("../../domain/errors/taskErrors");
const { UserExistsError, UserValidationError } = require("../../domain/errors/userErrors");

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof DomainError) {
    let statusCode = 400;

    if (error instanceof UserExistsError) {
      statusCode = 409;
    } else if (error instanceof UserValidationError || error instanceof TaskValidationError || error instanceof InvalidTaskDateError) {
      statusCode = 400;
    }

    return res.status(statusCode).json({ error: error.message });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;