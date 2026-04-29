const eventBus = require("../../infrastructure/events/eventBus");
const NotificationService = require("./notification.service");
const TaskCreatedEvent = require("../../domain/events/TaskCreatedEvent");
const TaskCompletedEvent = require("../../domain/events/TaskCompletedEvent");

class NotificationSubscriber {
  constructor() {
    this.notificationService = new NotificationService();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    eventBus.subscribe(
      TaskCreatedEvent.name,
      this.handleTaskCreated.bind(this),
    );
    eventBus.subscribe(
      TaskCompletedEvent.name,
      this.handleTaskCompleted.bind(this),
    );
  }

  async handleTaskCreated(event) {
    try {
      console.log(
        `[Subscriber] Catch ${TaskCreatedEvent.name} for task: ${event.title}`,
      );
      await this.notificationService.sendTaskNotification(
        event.taskId,
        event.userEmail,
      );
    } catch (error) {
      console.error(
        `[Subscriber] Failed to process ${TaskCreatedEvent.name}:`,
        error.message,
      );
    }
  }

  async handleTaskCompleted(event) {
    try {
      console.log(
        `[Subscriber] Catch ${TaskCompletedEvent.name} for task: ${event.title}`,
      );
      await this.notificationService.sendTaskNotification(
        event.taskId,
        event.userEmail,
      );
    } catch (error) {
      console.error(
        `[Subscriber] Failed to process ${TaskCompletedEvent.name}:`,
        error.message,
      );
    }
  }
}

module.exports = new NotificationSubscriber();
