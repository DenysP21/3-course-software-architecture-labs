const TaskFactory = require("../../../domain/factories/TaskFactory");
const TaskCreatedEvent = require('../../../domain/events/TaskCreatedEvent');

class CreateTaskHandler {
  constructor(taskRepository, eventBus) {
    this.taskRepository = taskRepository;
    this.eventBus = eventBus;
  }

  async handle(command) {
    const { title, description, dueDate, userId, userEmail } = command;
    const task = TaskFactory.create({ title, description, dueDate, userId });
    const savedTask = await this.taskRepository.create(task);

    if (this.eventBus) {
      const event = new TaskCreatedEvent({
        taskId: savedTask.id,
        title: savedTask.title,
        userId: savedTask.userId,
        userEmail: userEmail
      });
      this.eventBus.publish(event);
    }

    return savedTask; 
  }
}

module.exports = CreateTaskHandler;