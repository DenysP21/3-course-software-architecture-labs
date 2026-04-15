const prisma = require("../../lib/prisma");
const { toTaskDTO } = require("../../dto/task.dto");

class GetTaskByIdQuery {
  constructor({ taskId, userId }) {
    this.taskId = taskId;
    this.userId = userId;
  }
}

class GetTaskByIdHandler {
  async execute(query) {
    const task = await prisma.task.findUnique({
      where: { id: Number(query.taskId) },
    });

    if (!task || task.userId !== query.userId) {
      throw new Error("Task not found");
    }

    return toTaskDTO(task);
  }
}

module.exports = { GetTaskByIdQuery, GetTaskByIdHandler };