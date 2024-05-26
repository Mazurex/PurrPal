const Discord = require("discord.js");
const Global = require("../models/global");

module.exports = {
  name: Discord.Events.GuildDelete,
  once: false,
  async execute(guild) {
    try {
      let globalData = await Global.findOne();

      globalData.guilds = globalData.guilds.filter(
        (g) => g.guildId !== guild.id
      );
      globalData.totalGuilds -= 1;
      await globalData.save();
      console.log(`Removed from a guild: ${guild.name}`);
    } catch (error) {
      console.error("Error removing guild:", error);
    }
  },
};
