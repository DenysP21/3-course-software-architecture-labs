const { TaskValidationError } = require("../../../domain/errors/taskErrors");

class DeleteTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async handle(command) {
    const { taskId, userId } = command;
    const task = await this.taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new TaskValidationError("Task not found or access denied");
    }

    return await this.taskRepository.delete(taskId);
  }
}

module.exports = DeleteTaskHandler;