const { CreateTaskCommand } = require("../commands/task/create-task.handler");
const { UpdateTaskCommand } = require("../commands/task/update-task.handler");
const { DeleteTaskCommand } = require("../commands/task/delete-task.handler");
const { GetTasksQuery } = require("../queries/task/get-tasks.handler");
const { GetTaskByIdQuery } = require("../queries/task/get-task-by-id.handler");

class TaskController {
  constructor(
    createTaskHandler,
    updateTaskHandler,
    deleteTaskHandler,
    getTasksHandler,
    getTaskByIdHandler
  ) {
    this.createTaskHandler = createTaskHandler;
    this.updateTaskHandler = updateTaskHandler;
    this.deleteTaskHandler = deleteTaskHandler;
    this.getTasksHandler = getTasksHandler;
    this.getTaskByIdHandler = getTaskByIdHandler;

    this.createTask = this.createTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTask = this.getTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
  }

  async createTask(req, res) {
    try {
      const command = new CreateTaskCommand({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        userId: req.user.id,
      });
      const result = await this.createTaskHandler.execute(command);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTasks(req, res) {
    try {
      const query = new GetTasksQuery(req.user.id);
      const tasks = await this.getTasksHandler.execute(query);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTask(req, res) {
    try {
      const query = new GetTaskByIdQuery({
        taskId: req.params.id,
        userId: req.user.id,
      });
      const task = await this.getTaskByIdHandler.execute(query);
      res.json(task);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const command = new UpdateTaskCommand({
        taskId: req.params.id,
        userId: req.user.id,
        updateData: req.body,
      });
      const result = await this.updateTaskHandler.execute(command);
      res.json(result);
    } catch (error) {
      if (error.message.includes("access denied") || error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTask(req, res) {
    try {
      const command = new DeleteTaskCommand({
        taskId: req.params.id,
        userId: req.user.id,
      });
      await this.deleteTaskHandler.execute(command);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes("access denied") || error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TaskController;