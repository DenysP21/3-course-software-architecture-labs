const DomainError = require("../../domain/errors/DomainError");
const { UserExistsError } = require("../../domain/errors/userErrors");

const errorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  if (error instanceof DomainError) {
    let statusCode = 400;

    if (error instanceof UserExistsError) {
      statusCode = 409;
    } else if (error.message === "Invalid credentials") {
      statusCode = 401;
    }

    return res.status(statusCode).json({ error: error.message });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  res.status(500).json({ error: "Internal server error" });
};

module.exports = errorHandler;
