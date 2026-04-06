const taskRepository = require("../repositories/taskRepository");

const taskService = {
  async createTask(title, description, dueDate, userId) {
    if (!title) {
      throw new Error("Title is required");
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (dueDateObj < new Date()) {
        throw new Error("Due date cannot be in the past");
      }
    }

    return await taskRepository.create({
      title,
      description,
      dueDate,
      userId,
    });
  },

  async getTasksByUserId(userId) {
    return await taskRepository.findAllByUserId(userId);
  },

  async getTaskById(taskId) {
    return await taskRepository.findById(taskId);
  },

  async updateTask(taskId, userId, updateData) {
    const task = await taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    if (updateData.dueDate) {
      const dueDateObj = new Date(updateData.dueDate);
      if (dueDateObj < new Date()) {
        throw new Error("Due date cannot be in the past");
      }
    }

    return await taskRepository.update(taskId, updateData);
  },

  async deleteTask(taskId, userId) {
    const task = await taskRepository.findById(taskId);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    return await taskRepository.delete(taskId);
  },
};

module.exports = taskService;