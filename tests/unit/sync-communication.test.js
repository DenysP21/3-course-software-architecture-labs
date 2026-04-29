const {
  RegisterUserCommand,
  RegisterUserHandler,
} = require("../../src/application/commands/user/register-user.handler");
const NotificationService = require("../../src/modules/notifications/notification.service");

jest.mock("../../src/modules/notifications/notification.service");

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

describe("Synchronous Communication Test", () => {
  let registerHandler;
  let mockNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationService = new NotificationService();
    NotificationService.mockImplementation(() => mockNotificationService);
    registerHandler = new RegisterUserHandler(mockUserRepository);
  });

  test("Should call sendWelcomeEmail synchronously after user registration", async () => {
    const command = new RegisterUserCommand("test@test.com", "password123");
    const mockUser = { id: 1, email: "test@test.com" };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);
    mockNotificationService.sendWelcomeEmail = jest.fn();

    const result = await registerHandler.handle(command);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockNotificationService.sendWelcomeEmail).toHaveBeenCalledWith("test@test.com");
    expect(result).toEqual(mockUser);
  });
});