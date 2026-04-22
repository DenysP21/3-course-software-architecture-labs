const express = require("express");
const UserController = require("../controllers/userController");
const { RegisterUserHandler } = require("../commands/user/register-user.handler");
const { LoginUserHandler } = require("../commands/user/login-user.handler");
const { GetProfileHandler } = require("../queries/user/get-profile.handler");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const registerHandler = new RegisterUserHandler();
const loginHandler = new LoginUserHandler();
const getProfileHandler = new GetProfileHandler();

const userController = new UserController(registerHandler, loginHandler, getProfileHandler);

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
