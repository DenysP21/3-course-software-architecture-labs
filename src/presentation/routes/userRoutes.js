const express = require("express");
const UserController = require("../controllers/userController");
const UserService = require("../services/userService");
const userRepository = require("../../infrastructure/repositories/userRepository");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
