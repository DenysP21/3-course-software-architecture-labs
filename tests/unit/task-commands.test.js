const CreateTaskHandler = require("../../src/application/commands/task/create-task.handler");
const UpdateTaskHandler = require("../../src/application/commands/task/update-task.handler");
const DeleteTaskHandler = require("../../src/application/commands/task/delete-task.handler");

describe("Task Commands Unit Tests", () => {
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  test("CreateTaskHandler should call repository create", async () => {
    const handler = new CreateTaskHandler(mockRepo);
    const command = { title: "Test Task", userId: "user-1" };
    
    await handler.handle(command);
    
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test("UpdateTaskHandler should throw error if task not found", async () => {
    const handler = new UpdateTaskHandler(mockRepo);
    mockRepo.findById.mockResolvedValue(null);

    await expect(handler.handle({ taskId: "1", userId: "1", updateData: {} }))
      .rejects.toThrow("Task not found or access denied");
  });

  test("DeleteTaskHandler should call repository delete if authorized", async () => {
    const handler = new DeleteTaskHandler(mockRepo);
    const existingTask = { id: "task-1", userId: "user-1" };
    
    mockRepo.findById.mockResolvedValue(existingTask);
    
    await handler.handle({ taskId: "task-1", userId: "user-1" });
    
    expect(mockRepo.delete).toHaveBeenCalledWith("task-1");
  });
});