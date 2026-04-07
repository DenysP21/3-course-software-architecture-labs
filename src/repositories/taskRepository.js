const prisma = require("../lib/prisma");

const taskRepository = {
  async create(taskData) {
    return await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || "PENDING",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        userId: taskData.userId,
      },
    });
  },

  async findAllByUserId(userId) {
    return await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(taskId) {
    return await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });
  },

  async update(taskId, updateData) {
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    return await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData,
    });
  },

  async delete(taskId) {
    return await prisma.task.delete({
      where: { id: Number(taskId) },
    });
  },
};

module.exports = taskRepository;
