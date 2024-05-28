const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("beg")
    .setDescription("Beg for coins"),
  async execute(interaction) {
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply({
          content: "You don't have a profile yet. Adopt a cat first!",
          ephemeral: true,
        });
      }

      if (!profile.cat || profile.cat.length === 0) {
        return interaction.reply({
          content: "You don't have a cat yet. Adopt a cat first!",
          ephemeral: true,
        });
      }

      const cat = profile.cat[0]; // Assuming the first cat is the active one

      if (!cat.skills || typeof cat.skills.cuteness !== "number") {
        return interaction.reply({
          content: "Your cat doesn't have the required skills.",
          ephemeral: true,
        });
      }

      // Calculate the cuteness multiplier as a percentage
      const cutenessMultiplier = cat.skills.cuteness / 10;

      // Calculate the base coin amount and the total amount to give
      const baseCoinAmount = Math.floor(Math.random() * 41); // Between 1 and 40
      const totalCoinAmount = Math.floor(
        baseCoinAmount * (1 + cutenessMultiplier)
      );

      // Update user's coins
      profile.economy.coins += totalCoinAmount;
      profile.economy.totalCoins += totalCoinAmount;

      await profile.save();

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`${interaction.user.username} has begged`)
        .setDescription("You have begged a random stranger for coins")
        .addFields({ name: "Received", value: totalCoinAmount.toString() })
        .setFooter({
          text: `Cuteness Multiplier: x${(1 + cutenessMultiplier).toFixed(1)}`,
        })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Error while executing beg command:", err);
      return interaction.reply({
        content:
          "An error occurred while begging for coins. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
