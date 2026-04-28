const TaskFactory = require("../../domain/factories/TaskFactory");
const { TaskValidationError } = require("../../domain/errors/taskErrors");

class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async createTask(title, description, dueDate, userId) {
    const task = TaskFactory.create({ title, description, dueDate, userId });
    return await this.taskRepository.create(task);
  }

  async getTasksByUserId(userId) {
    return await this.taskRepository.findAllByUserId(userId);
  }

  async getTaskById(taskId) {
    return await this.taskRepository.findById(taskId);
  }

  async updateTask(taskId, userId, updateData) {
    const task = await this.taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new TaskValidationError("Task not found or access denied");
    }

    const updatedTask = TaskFactory.create({ 
      title: updateData.title || task.title, 
      description: updateData.description || task.description, 
      dueDate: updateData.dueDate || task.dueDate, 
      userId: task.userId 
    });

    return await this.taskRepository.update(taskId, updatedTask);
  }

  async deleteTask(taskId, userId) {
    const task = await this.taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new TaskValidationError("Task not found or access denied");
    }

    return await this.taskRepository.delete(taskId);
  }
}

module.exports = TaskService;
