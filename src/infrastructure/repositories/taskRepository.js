const prisma = require("../database/prisma");
const TaskMapper = require("../mappers/taskMapper");

const taskRepository = {
  async create(domainTask) {
    const rawTask = await prisma.task.create({
      data: TaskMapper.toPersistence(domainTask),
    });
    return TaskMapper.toDomainModel(rawTask);
  },

  async update(domainTask) {
    const rawTask = await prisma.task.update({
      where: { id: Number(domainTask.id) },
      data: TaskMapper.toPersistence(domainTask),
    });
    return TaskMapper.toDomainModel(rawTask);
  },

  async findAllByUserId(userId) {
    const rawTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rawTasks.map(TaskMapper.toDomainModel);
  },

  async findById(taskId) {
    const rawTask = await prisma.task.findUnique({
      where: { id: Number(taskId) },
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
