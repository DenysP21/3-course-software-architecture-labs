const { CreateTaskCommand, CreateTaskHandler } = require("../../src/commands/task/create-task.handler");
const { UpdateTaskCommand, UpdateTaskHandler } = require("../../src/commands/task/update-task.handler");
const { DeleteTaskCommand, DeleteTaskHandler } = require("../../src/commands/task/delete-task.handler");

describe("Task Commands Unit Tests", () => {
  let taskRepository;

  beforeEach(() => {
    taskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  describe("CreateTaskHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new CreateTaskHandler(taskRepository);
    });

    test("Should throw error if title is missing", async () => {
      const command = new CreateTaskCommand({ title: null, description: "Desc", dueDate: null, userId: 1 });
      await expect(handler.execute(command)).rejects.toThrow("Title is required");
    });

    test("Should throw error if due date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const command = new CreateTaskCommand({ title: "Title", description: "Desc", dueDate: pastDate, userId: 1 });
      
      await expect(handler.execute(command)).rejects.toThrow("Due date cannot be in the past");
    });

    test("Should create task successfully and return ID", async () => {
      taskRepository.create.mockResolvedValue({ id: 1, title: "Test Task" });
      const command = new CreateTaskCommand({ title: "Test Task", description: "Desc", dueDate: null, userId: 1 });
      
      const result = await handler.execute(command);
      
      expect(result).toEqual({ id: 1 });
      expect(taskRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("UpdateTaskHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new UpdateTaskHandler(taskRepository);
    });

    test("Should throw error if task not found", async () => {
      taskRepository.findById.mockResolvedValue(null);
      const command = new UpdateTaskCommand({ taskId: 1, userId: 1, updateData: {} });
      
      await expect(handler.execute(command)).rejects.toThrow("Task not found or access denied");
    });

    test("Should throw error if access denied", async () => {
      taskRepository.findById.mockResolvedValue({ userId: 2 });
      const command = new UpdateTaskCommand({ taskId: 1, userId: 1, updateData: {} });
      
      await expect(handler.execute(command)).rejects.toThrow("Task not found or access denied");
    });

    test("Should throw error if past due date", async () => {
      taskRepository.findById.mockResolvedValue({ userId: 1 });
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const command = new UpdateTaskCommand({ taskId: 1, userId: 1, updateData: { dueDate: pastDate } });
      
      await expect(handler.execute(command)).rejects.toThrow("Due date cannot be in the past");
    });

    test("Should update task successfully", async () => {
      taskRepository.findById.mockResolvedValue({ userId: 1 });
      taskRepository.update.mockResolvedValue({ id: 1, title: "Updated" });
      const command = new UpdateTaskCommand({ taskId: 1, userId: 1, updateData: { title: "Updated" } });
      
      const result = await handler.execute(command);
      expect(result).toEqual({ id: 1 });
      expect(taskRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("DeleteTaskHandler", () => {
    let handler;

    beforeEach(() => {
      handler = new DeleteTaskHandler(taskRepository);
    });

    test("Should throw error if access denied", async () => {
      taskRepository.findById.mockResolvedValue({ userId: 2 });
      const command = new DeleteTaskCommand({ taskId: 1, userId: 1 });
      
      await expect(handler.execute(command)).rejects.toThrow("Task not found or access denied");
    });

    test("Should delete task successfully", async () => {
      taskRepository.findById.mockResolvedValue({ userId: 1 });
      taskRepository.delete.mockResolvedValue(true);
      const command = new DeleteTaskCommand({ taskId: 1, userId: 1 });
      
      await handler.execute(command);
      expect(taskRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});