const prisma = require("../../infrastructure/database/prisma");

class GetTasksHandler {
  async execute({ userId }) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
    }));
  }
}

module.exports = new GetTasksHandler();
