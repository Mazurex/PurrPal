const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Gamble your coins for a chance to win more")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of coins you want to gamble")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const hasPass = false;

    try {
      // Fetch user profile
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply({
          content: "You don't have a profile yet.",
          ephemeral: true,
        });
      }

      if (!hasPass && amount >= 10_000) {
        return interaction.reply({
          content:
            "You do not have the correct gambling pass to gamble this much",
        });
      }

      if (amount < 500) {
        return interaction.reply({
          content: "You must bet at least `500` coins!",
        });
      } else if (hasPass && amount < 2_500) {
        return interaction.reply({
          content:
            "Due to your gambling pass, you must bet at least `2500` coins!",
        });
      }

      // Check if user has enough coins
      if (profile.economy.coins < amount) {
        return interaction.reply({
          content: "You don't have enough coins to gamble that amount.",
          ephemeral: true,
        });
      }

      // Define the multipliers and their probabilities, excluding x1 multiplier
      const multipliers = [0, 2, 3, 4];
      const probabilities = [0.4, 0.35, 0.2, 0.05]; // 40% chance for 0, 5% chance for 4

      // Determine the multiplier
      const random = Math.random();
      let cumulativeProbability = 0;
      let multiplier = 0;

      for (let i = 0; i < multipliers.length; i++) {
        cumulativeProbability += probabilities[i];
        if (random < cumulativeProbability) {
          multiplier = multipliers[i];
          break;
        }
      }

      // Calculate the winnings
      const winnings = amount * multiplier;
      const netResult = winnings - amount;

      // Update user's coins
      profile.economy.coins = profile.economy.coins - amount + winnings;
      await profile.save();

      // Determine result message
      const resultMessage =
        netResult >= 0
          ? `You won ${netResult} coins!`
          : `You lost all your coins!`;

      // Create the response embed
      const embed = new EmbedBuilder()
        .setColor(netResult >= 0 ? "Green" : "Red")
        .setTitle("🎲 Gambling Result 🎲")
        .setDescription(`You gambled ${amount} coins! ${resultMessage}`)
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({
        content: "There was a problem with the gamble command!",
        ephemeral: true,
      });
      console.log(err);
    }
  },
};
