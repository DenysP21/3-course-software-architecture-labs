const { toUserDTO } = require("../dto/user.dto");
const { RegisterUserCommand } = require("../../application/commands/user/register-user.handler");
const { LoginUserCommand } = require("../../application/commands/user/login-user.handler");
const { GetProfileQuery } = require("../../application/queries/user/get-profile.handler");

class UserController {
  constructor(registerHandler, loginHandler, getProfileHandler) {
    this.registerHandler = registerHandler;
    this.loginHandler = loginHandler;
    this.getProfileHandler = getProfileHandler;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async register(req, res, next) {
    try {
      const command = new RegisterUserCommand(req.body.email, req.body.password);
      const user = await this.registerHandler.handle(command);
      res.status(201).json(toUserDTO(user));
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const command = new LoginUserCommand(req.body.email, req.body.password);
      const result = await this.loginHandler.handle(command);
      res.status(200).json({
        token: result.token,
        user: toUserDTO(result.user),
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res, next) {
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
