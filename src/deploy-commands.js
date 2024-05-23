// Lets commands be visible because otherwise commands no meow

/*
const { REST, Routes } = require("discord.js");
require("dotenv").config();
const CommandLoader = require("./handlers/commandLoader");

const commandLoader = new CommandLoader();
const commands = commandLoader.load();

// Filter commands correctly
const adminCommands = commands
  .filter((command) => command.category === "admin")
  .map((command) => command.data.toJSON());

const regularCommands = commands
  .filter((command) => command.category !== "admin")
  .map((command) => command.data.toJSON());

const rest = new REST().setToken(process.env.TOKEN);

const deployCommands = async () => {
  try {
    console.log("Started refreshing slash commands");

    // Deploy admin commands only to the admin guild
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.ADMIN_GUILD_ID
      ),
      { body: adminCommands }
    );

    console.log("Successfully reloaded admin guild slash commands");

    // Deploy regular commands globally
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: regularCommands,
    });

    console.log("Successfully reloaded global slash commands");
  } catch (err) {
    console.error(err);
  }
};

deployCommands();
*/
const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.ADMIN_GUILD_ID
      ),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
