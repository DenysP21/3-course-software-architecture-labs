const TaskService = require("../../src/application/services/taskService");
const Task = require("../../src/domain/models/Task");

describe("Task Service Unit Tests", () => {
  let taskService;
  let taskRepository;

  beforeEach(() => {
    taskRepository = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    taskService = new TaskService(taskRepository);
  });

  test("Should throw error if title is missing on create", async () => {
    await expect(
      taskService.createTask(null, "Description", null, 1),
    ).rejects.toThrow("Title is required");
  });

  test("Should throw InvalidTaskDateError if due date is in the past on create", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await expect(
      taskService.createTask("Title", "Desc", pastDate, 1),
    ).rejects.toThrow("Due date cannot be in the past");
  });

  test("Should create task successfully", async () => {
    const mockTask = { id: 1, title: "Test Task" };
    taskRepository.create.mockResolvedValue(mockTask);

    const result = await taskService.createTask("Test Task", "Desc", null, 1);
    expect(result).toEqual(mockTask);
    expect(taskRepository.create).toHaveBeenCalledTimes(1);
  });

  test("Should return tasks by user id", async () => {
    taskRepository.findAllByUserId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await taskService.getTasksByUserId(1);
    expect(result.length).toBe(2);
  });

  test("Should throw TaskValidationError on update if task not found", async () => {
    taskRepository.findById.mockResolvedValue(null);
    await expect(taskService.updateTask(1, 1, {})).rejects.toThrow(
      "Task not found or access denied",
    );
  });

  test("Should throw error on update if access denied", async () => {
    taskRepository.findById.mockResolvedValue({ userId: 2 });
    await expect(taskService.updateTask(1, 1, {})).rejects.toThrow(
      "Task not found or access denied",
    );
  });

  test("Should throw error on update if past due date", async () => {
    const mockTask = new Task({ id: 1, title: "Old", userId: 1 });
    taskRepository.findById.mockResolvedValue(mockTask);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await expect(
      taskService.updateTask(1, 1, { dueDate: pastDate }),
    ).rejects.toThrow("Due date cannot be in the past");
  });

  test("Should update task successfully", async () => {
    const mockTask = new Task({ id: 1, title: "Old", userId: 1 });
    taskRepository.findById.mockResolvedValue(mockTask);
    taskRepository.update.mockResolvedValue({ id: 1, title: "Updated" });
    const result = await taskService.updateTask(1, 1, { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  test("Should throw error on delete if access denied", async () => {
    taskRepository.findById.mockResolvedValue({ userId: 2 });
    await expect(taskService.deleteTask(1, 1)).rejects.toThrow(
      "Task not found or access denied",
    );
  });

  test("Should delete task successfully", async () => {
    taskRepository.findById.mockResolvedValue({ userId: 1 });
    taskRepository.delete.mockResolvedValue(true);
    await taskService.deleteTask(1, 1);
    expect(taskRepository.delete).toHaveBeenCalledWith(1);
  });
});
