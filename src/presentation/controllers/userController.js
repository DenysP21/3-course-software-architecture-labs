const { toUserDTO } = require("../dto/user.dto");

class UserController {
  constructor(userService) {
    this.userService = userService;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async register(req, res, next) {
    const { email, password } = req.body;
    const user = await this.userService.register(email, password);
    res.status(201).json(toUserDTO(user));
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    const result = await this.userService.login(email, password);
    res.status(200).json({
      token: result.token,
      user: toUserDTO(result.user),
    });
  }

  async getProfile(req, res, next) {
    const user = await this.userService.getUserById(req.user.id);
    res.json(toUserDTO(user));
  }
}

module.exports = UserController;
