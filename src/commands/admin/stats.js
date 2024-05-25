const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const global = require("../../models/global");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show the stats of the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    try {
      const globalProfile = await global.findOne();
      const embed = new EmbedBuilder()
        .setColor("Aqua")
        .setTitle(`Bot stats`)
        .setDescription("View all the stats of the bot")
        .addFields(
          { name: "Total Guilds", value: globalProfile.totalGuilds },
          { name: "Total Cats", value: globalProfile.totalCats }
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  },
};
