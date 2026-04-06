const userService = require("../services/userService");

const userController = {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.register(email, password);
      res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = userController;