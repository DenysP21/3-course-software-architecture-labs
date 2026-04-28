const task = require("../../domain/models/Task");

class TaskMapper {
  static toDomainModel(rawTask) {
    if (!rawTask) return null;  

    return new task({
      id: rawTask.id,
      title: rawTask.title,
      description: rawTask.description,
      status: rawTask.status,
      dueDate: rawTask.dueDate,
      createdAt: rawTask.createdAt,
      updatedAt: rawTask.updatedAt,
      userId: rawTask.userId,
    }); 
  }

  static toPersistence(task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      userId: task.userId,
      };
    }
}

module.exports = TaskMapper;  