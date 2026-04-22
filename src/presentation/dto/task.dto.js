 function toTaskDTO(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : null,
  };
}

module.exports = { toTaskDTO };