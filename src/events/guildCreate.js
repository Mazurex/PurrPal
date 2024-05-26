const Discord = require("discord.js");
const Global = require("../models/global");

module.exports = {
  name: Discord.Events.GuildCreate,
  once: false,
  async execute(guild) {
    try {
      let globalData = await Global.findOne();

      globalData.guilds.push({
        guildId: guild.id,
        disabledCommands: [],
      });
      globalData.totalGuilds += 1;
      await globalData.save();
      console.log(`Joined a new guild: ${guild.name}`);
    } catch (error) {
      console.error("Error adding guild:", error);
    }
  },
};
