const express = require("express");
const UserController = require("../controllers/userController");
const userRepository = require("../repositories/userRepository");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const userController = new UserController(userRepository);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
