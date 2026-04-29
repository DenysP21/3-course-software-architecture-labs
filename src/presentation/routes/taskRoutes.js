const express = require("express");
const TaskController = require("../controllers/taskController");
const taskRepository = require("../../infrastructure/repositories/taskRepository");
const authMiddleware = require("../middleware/auth");
const eventBus = require("../../infrastructure/events/eventBus");

const CreateTaskHandler = require("../../application/commands/task/create-task.handler");
const UpdateTaskHandler = require("../../application/commands/task/update-task.handler");
const DeleteTaskHandler = require("../../application/commands/task/delete-task.handler");
const GetTasksHandler = require("../../application/queries/task/get-tasks.handler");
const GetTaskByIdHandler = require("../../application/queries/task/get-task-by-id.handler");

const router = express.Router();

const createHandler = new CreateTaskHandler(taskRepository, eventBus);
const updateHandler = new UpdateTaskHandler(taskRepository, eventBus);
const deleteHandler = new DeleteTaskHandler(taskRepository);
const getTasksQuery = new GetTasksHandler();
const getTaskByIdQuery = new GetTaskByIdHandler();

const taskController = new TaskController(
  createHandler,
  updateHandler,
  deleteHandler,
  getTasksQuery,
  getTaskByIdQuery,
);

router.post("/", authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getTasks);
router.get("/:id", authMiddleware, taskController.getTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;