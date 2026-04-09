const { toUserDTO } = require("../dto/user.dto");

class UserController {
  constructor(userService) {
    this.userService = userService;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.register(email, password);
      res.status(201).json(toUserDTO(user));
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);
      res.status(200).json({
        token: result.token,
        user: toUserDTO(result.user),
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await this.userService.getUserById(req.user.id);
      res.json(toUserDTO(user));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
