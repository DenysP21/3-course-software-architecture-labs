class UpdateTaskCommand {
  constructor({ taskId, userId, updateData }) {
    this.taskId = taskId;
    this.userId = userId;
    this.updateData = updateData;
  }
}

class UpdateTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(command) {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task || task.userId !== command.userId) {
      throw new Error("Task not found or access denied");
    }

    if (command.updateData.dueDate) {
      const dueDateObj = new Date(command.updateData.dueDate);
      if (dueDateObj < new Date()) {
        throw new Error("Due date cannot be in the past");
      }
    }

    await this.taskRepository.update(command.taskId, command.updateData);

    return { id: command.taskId };
  }
}

module.exports = { UpdateTaskCommand, UpdateTaskHandler };