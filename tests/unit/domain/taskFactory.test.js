const TaskFactory = require("../../../src/domain/factories/TaskFactory");
const {
  ValidationError,
  InvalidDateError,
} = require("../../../src/domain/errors/DomainError");

describe("TaskFactory Unit Tests (Pure Domain)", () => {
  test("Should throw ValidationError if title is missing", () => {
    expect(() => {
      TaskFactory.create({ description: "Some desc", userId: 1 });
    }).toThrow(ValidationError);
  });

  test("Should throw ValidationError if title is empty string", () => {
    expect(() => {
      TaskFactory.create({ title: "   ", userId: 1 });
    }).toThrow(ValidationError);
  });

  test("Should throw ValidationError if userId is missing", () => {
    expect(() => {
      TaskFactory.create({ title: "Valid Title", description: "Desc" });
    }).toThrow(ValidationError);
  });

  test("Should throw InvalidDateError if dueDate is in the past", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    expect(() => {
      TaskFactory.create({
        title: "Valid Title",
        userId: 1,
        dueDate: pastDate,
      });
    }).toThrow(InvalidDateError);
  });

  test("Should successfully create a Task entity with valid data", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const task = TaskFactory.create({
      title: "Learn DDD",
      description: "Refactor lab 2",
      userId: 42,
      dueDate: futureDate,
    });

    expect(task.title).toBe("Learn DDD");
    expect(task.description).toBe("Refactor lab 2");
    expect(task.userId).toBe(42);

    expect(task.status).toBe("PENDING");
  });
});
