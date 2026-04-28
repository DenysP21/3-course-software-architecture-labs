const TaskFactory = require("../../../domain/factories/TaskFactory");

class CreateTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async handle(command) {
    const { title, description, dueDate, userId } = command;

    const task = TaskFactory.create({ title, description, dueDate, userId });
    
    return await this.taskRepository.create(task);
  }
}

module.exports = CreateTaskHandler;