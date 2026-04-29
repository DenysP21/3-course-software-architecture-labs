const EventEmitter = require("events");

class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }

  publish(event) {
    const eventName = event.constructor.name;
    console.log(`[EventBus] Publishing event: ${eventName}`);

    setImmediate(() => {
      this.emitter.emit(eventName, event);
    });
  }

  subscribe(eventName, handler) {
    console.log(`[EventBus] Subscribed to: ${eventName}`);
    this.emitter.on(eventName, handler);
  }
}

module.exports = new EventBus();
