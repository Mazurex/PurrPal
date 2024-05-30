const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const global = require("../../models/global");
const { update_channel_id } = require("../../settings.json");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Send an update to the updates channel")
    .addStringOption((option) =>
      option
        .setName("changes")
        .setDescription("What changes were made")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const changes = interaction.options.getString("changes");
    try {
      const globalData = await global.findOne();

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`Bot update by ${interaction.user.username}`)
        .setDescription(changes)
        .setFooter({
          text: `Last update: ${
            globalData.lastUpdate
              ? `<t:${Math.floor(globalData.lastUpdate.getTime() / 1000)}:R>`
              : "N/A"
          }`,
        })
        .setTimestamp();

      const channel = await interaction.client.channels.fetch(
        update_channel_id
      );

      await channel.send({ embeds: [embed] });

      globalData.lastUpdate = new Date();
      await globalData.save();

      interaction.reply({
        content: "Update posted successfully!",
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      interaction.reply("There was an error with posting an update");
    }
  },
};
