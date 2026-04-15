const prisma = require("../../lib/prisma");
const { toTaskDTO } = require("../../dto/task.dto");

class GetTasksQuery {
  constructor(userId) {
    this.userId = userId;
  }
}

class GetTasksHandler {
  async execute(query) {
    const tasks = await prisma.task.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: "desc" },
    });

    return tasks.map(toTaskDTO);
  }
}

module.exports = { GetTasksQuery, GetTasksHandler };