const prisma = require("../../../infrastructure/database/prisma");

class GetTaskByIdHandler {
  async handle({ taskId, userId }) {
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    if (!task || task.userId !== userId) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
    };
  }
}

module.exports = GetTaskByIdHandler;
