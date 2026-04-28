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

    const methods = {
      title: 'updateTitle',
      description: 'updateDescription',
      dueDate: 'updateDueDate'
    };

    Object.keys(methods).forEach(field => {
      if (updateData[field] !== undefined) {
        task[methods[field]](updateData[field]);
      }
    });

    if (updateData.status === "COMPLETED") {
      task.markAsCompleted();
    }

    return await this.taskRepository.update(task);
  }
}

module.exports = UpdateTaskHandler;