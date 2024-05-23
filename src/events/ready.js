const Discord = require("discord.js");

module.exports = {
  name: Discord.Events.ClientReady,
  once: false,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
  },
};
