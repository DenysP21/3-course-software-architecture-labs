const { DomainError, ValidationError } = require("../errors/DomainError");

class Task {
  constructor({
    id,
    title,
    description,
    status,
    dueDate,
    userId,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.title = title;
    this.description = description || "";
    this.status = status || "PENDING";
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  markAsCompleted() {
    if (this.status === "COMPLETED") {
      throw new DomainError("Task is already completed");
    }
    this.status = "COMPLETED";
    this.updatedAt = new Date();
  }

  updateTitle(newTitle) {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new ValidationError("Title cannot be empty");
    }
    this.title = newTitle;
    this.updatedAt = new Date();
  }
}

module.exports = Task;
