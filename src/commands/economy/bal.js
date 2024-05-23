const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Show your current balance"),
  async execute(interaction) {
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply("You don't have a profile yet.");
      }

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${interaction.user.username}'s Balance`)
        .setDescription("View your current balance")
        .addFields({ name: "Amount", value: profile.economy.coins.toString() })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      interaction.reply("There was an error with checking your balance");
    }
  },
};
