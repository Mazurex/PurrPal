const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const drawLottery = require("../../handlers/lotteryScheduler");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("endlottery")
    .setDescription("Force ends the lottery.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      await drawLottery(interaction.client);
      await interaction.followUp("There lottery has been forcefully ended!");
    } catch (err) {
      console.error(err);
      interaction.followUp(
        "There was an error trying to force end the lottery"
      );
    }
  },
};
