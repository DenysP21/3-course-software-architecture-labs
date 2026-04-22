const express = require("express");
const router = express.Router();

const taskRepository = require("../repositories/taskRepository");
const { CreateTaskHandler } = require("../commands/task/create-task.handler");
const { UpdateTaskHandler } = require("../commands/task/update-task.handler");
const { DeleteTaskHandler } = require("../commands/task/delete-task.handler");
const { GetTasksHandler } = require("../queries/task/get-tasks.handler");
const { GetTaskByIdHandler } = require("../queries/task/get-task-by-id.handler");
const TaskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");

const createTaskHandler = new CreateTaskHandler(taskRepository);
const updateTaskHandler = new UpdateTaskHandler(taskRepository);
const deleteTaskHandler = new DeleteTaskHandler(taskRepository);
const getTasksHandler = new GetTasksHandler();
const getTaskByIdHandler = new GetTaskByIdHandler();

const taskController = new TaskController(
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  getTasksHandler,
  getTaskByIdHandler
);

router.use(authMiddleware);

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;