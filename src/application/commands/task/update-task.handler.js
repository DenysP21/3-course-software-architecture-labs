const { TaskValidationError } = require("../../../domain/errors/taskErrors");
const TaskCompletedEvent = require('../../../domain/events/TaskCompletedEvent');

class UpdateTaskHandler {
  constructor(taskRepository, eventBus) {
    this.taskRepository = taskRepository;
    this.eventBus = eventBus;
  }

  async handle(command) {
    const { taskId, userId, updateData, userEmail } = command;
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

    const updatedTask = await this.taskRepository.update(task);

    if (this.eventBus && updateData.status === "COMPLETED") {
      const event = new TaskCompletedEvent({
        taskId: task.id || taskId,
        userId: task.userId,
        userEmail: userEmail
      });
      this.eventBus.publish(event);
    }

    return updatedTask;
  }
}

module.exports = UpdateTaskHandler;