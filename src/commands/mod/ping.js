const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns the bots ping!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const message = await interaction.reply({
      content: "Pinging <a:loading:1054899324544360559>",
      fetchReply: true,
    });
    interaction.editReply(
      `🏓 ${message.createdTimestamp - interaction.createdTimestamp}ms`
    );
  },
};
