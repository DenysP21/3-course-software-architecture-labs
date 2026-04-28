const { toTaskDTO } = require("../dto/task.dto");

class TaskController {
  constructor(taskService) {
    this.taskService = taskService;

    this.createTask = this.createTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTask = this.getTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
  }

  async createTask(req, res, next) {
    const { title, description, dueDate } = req.body;
    const task = await this.taskService.createTask(
      title,
      description,
      dueDate,
      req.user.id,
    );
    res.status(201).json(toTaskDTO(task));
  }

  async getTasks(req, res, next) {
    const tasks = await this.taskService.getTasksByUserId(req.user.id);
    res.json(tasks.map(toTaskDTO));
  }

  async getTask(req, res, next) {
    const task = await this.taskService.getTaskById(req.params.id);
    if (!task || task.userId !== req.user.id) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }
    res.json(toTaskDTO(task));
  }

  async updateTask(req, res, next) {
    const task = await this.taskService.updateTask(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json(toTaskDTO(task));
  }

  async deleteTask(req, res, next) {
    await this.taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).send();
  }
}

module.exports = TaskController;
