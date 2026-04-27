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
}

module.exports = TaskMapper;  