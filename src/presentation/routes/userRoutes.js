const express = require("express");
const UserController = require("../controllers/userController");
const userRepository = require("../../infrastructure/repositories/userRepository");
const authMiddleware = require("../middleware/auth");

const { RegisterUserHandler } = require("../../application/commands/user/register-user.handler");
const { LoginUserHandler } = require("../../application/commands/user/login-user.handler");
const { GetProfileHandler } = require("../../application/queries/user/get-profile.handler");

const router = express.Router();

const registerHandler = new RegisterUserHandler(userRepository);
const loginHandler = new LoginUserHandler(userRepository);
const getProfileHandler = new GetProfileHandler();

const userController = new UserController(registerHandler, loginHandler, getProfileHandler);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
