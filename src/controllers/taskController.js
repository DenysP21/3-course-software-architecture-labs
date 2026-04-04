const taskService = require("../services/taskService");

const taskController = {
  async createTask(req, res) {
    try {
      const { title, description, dueDate } = req.body;
      const task = await taskService.createTask(
        title,
        description,
        dueDate,
        req.user.id
      );
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getTasks(req, res) {
    try {
      const tasks = await taskService.getTasksByUserId(req.user.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTask(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateTask(req, res) {
    try {
      const task = await taskService.updateTask(req.params.id, req.user.id, req.body);
      res.json(task);
    } catch (error) {
      if (error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async deleteTask(req, res) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes("access denied")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = taskController;