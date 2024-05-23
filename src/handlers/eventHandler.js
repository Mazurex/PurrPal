const fs = require("fs");
const path = require("path");

class EventHandler {
  constructor(client) {
    this.client = client;
    this.eventsPath = path.join(__dirname, "..", "events");
  }

  load() {
    const eventFiles = fs
      .readdirSync(this.eventsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
      const filePath = path.join(this.eventsPath, file);
      const event = require(filePath);
      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
}

module.exports = EventHandler;
