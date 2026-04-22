class DeleteTaskCommand {
  constructor({ taskId, userId }) {
    this.taskId = taskId;
    this.userId = userId;
  }
}

class DeleteTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(command) {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task || task.userId !== command.userId) {
      throw new Error("Task not found or access denied");
    }

    await this.taskRepository.delete(command.taskId);
  }
}

module.exports = { DeleteTaskCommand, DeleteTaskHandler };