const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 86400, // 24 hours cooldown
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Get free daily coins!"),
  async execute(interaction) {
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply({
          content: "You don't have a profile yet.",
          ephemeral: true,
        });
      }

      // Calculate the intelligence multiplier as a percentage
      const intelligenceMultiplier =
        (profile.cat[0].skills.intelligence || 1) / 10;

      // Calculate the base coin amount and the total amount to give
      const baseAmount = Math.floor(Math.random() * 4501) + 500; // Random between 500 and 5000
      const totalAmount = Math.floor(baseAmount * (1 + intelligenceMultiplier));

      // Update user's coins
      profile.economy.coins += totalAmount;

      await profile.save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${interaction.user.username}'s daily rewards`)
        .setDescription("You have claimed your daily reward!")
        .addFields({ name: "Amount received", value: totalAmount.toString() })
        .setFooter({
          text: `Intelligence Multiplier: x${(
            1 + intelligenceMultiplier
          ).toFixed(1)}`,
        })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({
        content: "Error with the daily command!",
        ephemeral: true,
      });
      console.error(err);
    }
  },
};
