const TaskFactory = require("../../domain/factories/TaskFactory");
const { TaskValidationError } = require("../../domain/errors/taskErrors");

class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async createTask(title, description, dueDate, userId) {
    const taskObject = TaskFactory.create({ title, description, dueDate, userId });
    
    return await this.taskRepository.create({
      title: taskObject.title,
      description: taskObject.description,
      dueDate: taskObject.dueDate,
      userId: taskObject.userId,
    });
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

    if (updateData.dueDate) {
      TaskFactory.create({ 
        title: task.title, 
        description: task.description, 
        dueDate: updateData.dueDate, 
        userId: task.userId 
      });
    }

    return await this.taskRepository.update(taskId, updateData);
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
