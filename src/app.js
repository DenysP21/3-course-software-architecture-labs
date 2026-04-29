const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./presentation/routes/userRoutes");
const taskRoutes = require("./presentation/routes/taskRoutes");
const errorHandler = require("./presentation/middleware/errorHandler");

require("./modules/notifications/notification.subscriber");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.use(errorHandler);

module.exports = app;
