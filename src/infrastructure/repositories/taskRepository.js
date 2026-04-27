const prisma = require("../database/prisma");
const TaskMapper = require("../mappers/TaskMapper");

const taskRepository = {
  async create(taskData) {
    const rawTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || "PENDING",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        userId: taskData.userId,
      },
    });
    return TaskMapper.toDomainModel(rawTask);
  },

  async findAllByUserId(userId) {
    const rawTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rawTasks.map(rawTask => TaskMapper.toDomainModel(rawTask));
  },

  async findById(taskId) {
    const rawTask = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });
    return TaskMapper.toDomainModel(rawTask);
  },

  async update(taskId, updateData) {
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const rawTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData,
    });
    return TaskMapper.toDomainModel(rawTask);
  },

  async delete(taskId) {
    const rawTask = await prisma.task.delete({
      where: { id: Number(taskId) },
    });
    return TaskMapper.toDomainModel(rawTask);
  },
};

module.exports = taskRepository;
