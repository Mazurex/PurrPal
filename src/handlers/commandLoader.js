const fs = require("fs");
const path = require("path");

class CommandLoader {
  constructor() {
    this.commandsPath = path.join(__dirname, "..", "commands");
  }

  load() {
    const categories = fs.readdirSync(this.commandsPath);
    let commands = [];

    for (const category of categories) {
      const categoryPath = path.join(this.commandsPath, category);
      const commandFiles = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);

        if (command.data && command.execute) {
          command.category = category;
          commands.push(command);
        } else {
          console.warn(
            `The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }

    return commands;
  }
}

module.exports = CommandLoader;
