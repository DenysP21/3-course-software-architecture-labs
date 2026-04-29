const { performance } = require('perf_hooks');
const EventEmitter = require('events');

const mockUserRepository = { 
  save: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }) 
};

const mockTaskRepository = { 
  create: jest.fn().mockResolvedValue({ id: 10, title: 'New Task', userId: 1 }) 
};

const mockNotificationService = {
  sendWelcomeEmail: jest.fn().mockImplementation(() => {
    return new Promise(resolve => setTimeout(resolve, 200));
  }),
  sendTaskNotification: jest.fn().mockImplementation(() => {
    return new Promise(resolve => setTimeout(resolve, 200));
  })
};

const TaskFactory = {
  create: jest.fn().mockReturnValue({ title: 'New Task', userId: 1 })
};

class TaskCreatedEvent {
  constructor(data) {
    Object.assign(this, data);
    this.name = 'TaskCreatedEvent';
  }
}

class TestEventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }
  publish(event) {
    this.emitter.emit(event.name, event);
  }
  subscribe(eventName, handler) {
    this.emitter.on(eventName, handler);
  }
}

class SyncRegisterUserHandler {
  constructor(userRepository, notificationService) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  async handle(command) {
    const user = await this.userRepository.save(command);
    await this.notificationService.sendWelcomeEmail(user.email);
    return user;
  }
}

class AsyncCreateTaskHandler {
  constructor(taskRepository, eventBus) {
    this.taskRepository = taskRepository;
    this.eventBus = eventBus;
  }

  async handle(command) {
    const task = TaskFactory.create(command);
    const savedTask = await this.taskRepository.create(task);

    if (this.eventBus) {
      const event = new TaskCreatedEvent({
        taskId: savedTask.id,
        title: savedTask.title,
        userId: savedTask.userId,
        userEmail: command.userEmail
      });
      this.eventBus.publish(event);
    }

    return savedTask;
  }
}

describe('Communication Metrics: Synchronous vs Asynchronous', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Synchronous approach: response time includes the external service delay', async () => {
    const handler = new SyncRegisterUserHandler(mockUserRepository, mockNotificationService);
    const command = { username: 'testuser', email: 'test@test.com' };

    const start = performance.now();
    await handler.handle(command);
    const end = performance.now();
    
    const executionTime = end - start;
    console.log(`Sync execution time: ${executionTime.toFixed(2)} ms`);
    
    expect(mockNotificationService.sendWelcomeEmail).toHaveBeenCalledWith('test@test.com');
    expect(executionTime).toBeGreaterThanOrEqual(200);
  });

  it('Asynchronous approach: main operation completes immediately without waiting', async () => {
    const eventBus = new TestEventBus();
    
    eventBus.subscribe('TaskCreatedEvent', async (event) => {
      await mockNotificationService.sendTaskNotification(event.taskId, event.userEmail);
    });

    const handler = new AsyncCreateTaskHandler(mockTaskRepository, eventBus);
    const command = { title: 'Test', description: 'Test', userId: 1, userEmail: 'test@test.com' };

    const start = performance.now();
    await handler.handle(command);
    const end = performance.now();
    
    const executionTime = end - start;
    console.log(`Async execution time: ${executionTime.toFixed(2)} ms`);
    
    expect(executionTime).toBeLessThan(50); 
    
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(mockNotificationService.sendTaskNotification).toHaveBeenCalledWith(10, 'test@test.com');
  });
});