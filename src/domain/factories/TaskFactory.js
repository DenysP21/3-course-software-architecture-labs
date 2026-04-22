const Task = require("../models/Task");
const { ValidationError, InvalidDateError } = require("../errors/taskErrors");

class TaskFactory {
  static create({ title, description, dueDate, userId }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError("Title is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required to create a task");
    }

    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (parsedDate < new Date()) {
        throw new InvalidDateError("Due date cannot be in the past");
      }
    }

    return new Task({
      title,
      description,
      dueDate,
      userId,
      status: "PENDING",
    });
  }
}

module.exports = TaskFactory;
