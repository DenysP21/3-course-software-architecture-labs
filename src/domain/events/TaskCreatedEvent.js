class TaskCreatedEvent {
  constructor({ taskId, title, userId, userEmail }) {
    this.taskId = taskId;
    this.title = title;
    this.userId = userId;
    this.userEmail = userEmail;
    this.occurredAt = new Date();

    Object.freeze(this);
  }
}

module.exports = TaskCreatedEvent;
