const { TaskValidationError } = require("../../../domain/errors/taskErrors");

class UpdateTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async handle(command) {
    const { taskId, userId, updateData } = command;
    const task = await this.taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new TaskValidationError("Task not found or access denied");
    }

    if (updateData.title !== undefined) {
      task.updateTitle(updateData.title);
    }

    if (updateData.description !== undefined) {
      task.updateDescription(updateData.description);
    }

    if (updateData.dueDate !== undefined) {
      task.updateDueDate(updateData.dueDate);
    }

    if (updateData.status === "COMPLETED") {
      task.markAsCompleted();
    }

    return await this.taskRepository.update(task);
  }
}

module.exports = UpdateTaskHandler;