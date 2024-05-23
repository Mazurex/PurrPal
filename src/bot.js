// Bot code that isn't turned on by itself, activated through sharding

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const mongoose = require("mongoose");
require("dotenv").config();

const CommandLoader = require("./handlers/commandLoader");
const EventHandler = require("./handlers/eventHandler");

class Bot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      allowedMentions: { parse: ["roles"] },
    });

    this.client.commands = new Collection();
    this.loadCommands();
    this.loadEvents();
  }

  loadCommands() {
    const commandLoader = new CommandLoader();
    const commands = commandLoader.load();
    for (const command of commands) {
      this.client.commands.set(command.data.name, command);
    }
  }

  loadEvents() {
    const eventHandler = new EventHandler(this.client);
    eventHandler.load();
  }

  async start() {
    try {
      await mongoose.connect(process.env.URI);
      console.log("Logged into the database");
      await this.client.login(process.env.TOKEN);
      console.log("Bot is online");
    } catch (err) {
      console.log(err);
    }
  }
}

const bot = new Bot();
bot.start();
