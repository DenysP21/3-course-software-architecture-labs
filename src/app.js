const express = require("express");
const app = express();
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

module.exports = app;
