const createTaskHandler = require("../../commands/task/create-task.handler");
const updateTaskHandler = require("../../commands/task/update-task.handler");
const deleteTaskHandler = require("../../commands/task/delete-task.handler");
const getTasksHandler = require("../../queries/task/get-tasks.handler");
const getTaskByIdHandler = require("../../queries/task/get-task-by-id.handler");

class TaskController {
  async createTask(req, res, next) {
    const { title, description, dueDate } = req.body;
    const result = await createTaskHandler.execute({
      title,
      description,
      dueDate,
      userId: req.user.id,
    });
    res.status(201).json(result);
  }

  async getTasks(req, res, next) {
    const tasks = await getTasksHandler.execute({ userId: req.user.id });
    res.json(tasks);
  }

  async getTask(req, res, next) {
    const task = await getTaskByIdHandler.execute({
      taskId: req.params.id,
      userId: req.user.id,
    });
    res.json(task);
  }

  async updateTask(req, res, next) {
    const result = await updateTaskHandler.execute({
      taskId: req.params.id,
      userId: req.user.id,
      updateData: req.body,
    });
    res.json(result);
  }

  async deleteTask(req, res, next) {
    await deleteTaskHandler.execute({
      taskId: req.params.id,
      userId: req.user.id,
    });
    res.status(204).send();
  }
}

module.exports = new TaskController();
