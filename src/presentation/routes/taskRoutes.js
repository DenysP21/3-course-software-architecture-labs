const express = require("express");
const TaskController = require("../controllers/taskController");
const TaskService = require("../../application/services/taskService");
const taskRepository = require("../../infrastructure/repositories/taskRepository");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

router.post("/", authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getTasks);
router.get("/:id", authMiddleware, taskController.getTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;
