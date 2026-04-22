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

  async createTask(req, res) {
    try {
      const { title, description, dueDate } = req.body;
      const task = await this.taskService.createTask(
        title,
        description,
        dueDate,
        req.user.id,
      );
      res.status(201).json(toTaskDTO(task));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTasks(req, res) {
    try {
      const tasks = await this.taskService.getTasksByUserId(req.user.id);
      res.json(tasks.map(toTaskDTO));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTask(req, res) {
    try {
      const task = await this.taskService.getTaskById(req.params.id);
      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(toTaskDTO(task));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const task = await this.taskService.updateTask(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json(toTaskDTO(task));
    } catch (error) {
      if (error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTask(req, res) {
    try {
      await this.taskService.deleteTask(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TaskController;
