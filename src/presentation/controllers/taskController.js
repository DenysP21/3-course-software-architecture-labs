class TaskController {
  constructor(
    createHandler,
    updateHandler,
    deleteHandler,
    getTasksQuery,
    getTaskByIdQuery,
  ) {
    this.createHandler = createHandler;
    this.updateHandler = updateHandler;
    this.deleteHandler = deleteHandler;
    this.getTasksQuery = getTasksQuery;
    this.getTaskByIdQuery = getTaskByIdQuery;

    this.createTask = this.createTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTask = this.getTask.bind(this);
  }

  async createTask(req, res, next) {
    try {
      const command = {
        ...req.body,
        userId: req.user.id,
        userEmail: req.user.email,
      };
      const result = await this.createHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const command = {
        taskId: req.params.id,
        userId: req.user.id,
        userEmail: req.user.email,
        updateData: req.body,
      };
      const result = await this.updateHandler.handle(command);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const command = { taskId: req.params.id, userId: req.user.id };
      await this.deleteHandler.handle(command);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req, res, next) {
    try {
      const tasks = await this.getTasksQuery.handle({ userId: req.user.id });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTask(req, res, next) {
    try {
      const task = await this.getTaskByIdQuery.handle({
        taskId: req.params.id,
        userId: req.user.id,
      });
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
