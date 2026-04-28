const CreateTaskHandler = require("../../src/application/commands/task/create-task.handler");
const Task = require("../../src/domain/models/Task");

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

  test("CreateTaskHandler should create a task", async () => {
    const handler = new CreateTaskHandler(mockRepo);
    const command = { title: "New Task", userId: "user-1" };
    
    await handler.handle(command);
    
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test("UpdateTaskHandler should throw error if task not found", async () => {
    const UpdateTaskHandler = require("../../src/application/commands/task/update-task.handler");
    const handler = new UpdateTaskHandler(mockRepo);
    
    mockRepo.findById.mockResolvedValue(null);

    await expect(handler.handle({ taskId: "1", userId: "1", updateData: {} }))
      .rejects.toThrow("Task not found or access denied");
  });
});