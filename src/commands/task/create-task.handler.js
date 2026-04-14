class CreateTaskCommand {
  constructor({ title, description, dueDate, userId }) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.userId = userId;
  }
}

class CreateTaskHandler {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(command) {
    if (!command.title) {
      throw new Error("Title is required");
    }

    if (command.dueDate) {
      const dueDateObj = new Date(command.dueDate);
      if (dueDateObj < new Date()) {
        throw new Error("Due date cannot be in the past");
      }
    }

    const task = await this.taskRepository.create({
      title: command.title,
      description: command.description,
      dueDate: command.dueDate,
      userId: command.userId,
    });

    return { id: task.id };
  }
}

module.exports = { CreateTaskCommand, CreateTaskHandler };