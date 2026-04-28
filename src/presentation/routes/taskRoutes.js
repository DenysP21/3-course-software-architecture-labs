const express = require("express");
const TaskController = require("../controllers/taskController");
const taskRepository = require("../../infrastructure/repositories/taskRepository");
const authMiddleware = require("../middleware/auth");

const CreateTaskHandler = require("../../application/commands/task/create-task.handler");
const UpdateTaskHandler = require("../../application/commands/task/update-task.handler");
const DeleteTaskHandler = require("../../application/commands/task/delete-task.handler");
const getTasksHandler = require("../../application/queries/task/get-tasks.handler");
const getTaskByIdHandler = require("../../application/queries/task/get-task-by-id.handler");

const router = express.Router();

const createHandler = new CreateTaskHandler(taskRepository);
const updateHandler = new UpdateTaskHandler(taskRepository);
const deleteHandler = new DeleteTaskHandler(taskRepository);

const taskController = new TaskController(
  createHandler,
  updateHandler,
  deleteHandler,
  getTasksHandler,
  getTaskByIdHandler,
);

router.post("/", authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getTasks);
router.get("/:id", authMiddleware, taskController.getTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;
