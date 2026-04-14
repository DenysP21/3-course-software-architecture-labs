const { toUserDTO } = require("../dto/user.dto");
const { registerUser } = require("../commands/user/register-user.handler");
const { loginUser } = require("../commands/user/login-user.handler");
const { getProfile } = require("../queries/user/get-profile.handler");

class UserController {
  constructor(userRepository) {
    this.userRepository = userRepository;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await registerUser({ email, password }, this.userRepository);
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
      const result = await loginUser({ email, password }, this.userRepository);
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
      const user = await getProfile(req.user.id, this.userRepository);
      res.json(toUserDTO(user));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
