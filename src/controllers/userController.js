const { RegisterUserCommand } = require("../commands/user/register-user.handler");
const { LoginUserCommand } = require("../commands/user/login-user.handler");
const { GetProfileQuery } = require("../queries/user/get-profile.handler");
const { toUserDTO } = require("../dto/user.dto");

class UserController {
  constructor(registerHandler, loginHandler, getProfileHandler) {
    this.registerHandler = registerHandler;
    this.loginHandler = loginHandler;
    this.getProfileHandler = getProfileHandler;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async register(req, res) {
    try {
      const command = new RegisterUserCommand(req.body.email, req.body.password);
      const user = await this.registerHandler.handle(command);
      res.status(201).json(user);
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const command = new LoginUserCommand(req.body.email, req.body.password);
      const result = await this.loginHandler.handle(command);
      res.status(200).json({
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const query = new GetProfileQuery(req.user.id);
      const userDTO = await this.getProfileHandler.handle(query);
      res.json(userDTO);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
