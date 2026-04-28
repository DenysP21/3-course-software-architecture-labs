const Task = require("../models/Task");
const {
  TaskValidationError,
  InvalidTaskDateError,
} = require("../errors/taskErrors");

class TaskFactory {
  static create({ title, description, dueDate, userId }) {
    if (!title || title.trim().length === 0) {
      throw new TaskValidationError("Title is required");
    }

    if (!userId) {
      throw new TaskValidationError("User ID is required to create a task");
    }

    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (parsedDate < new Date()) {
        throw new InvalidTaskDateError("Due date cannot be in the past");
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
