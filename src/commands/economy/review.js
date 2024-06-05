const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const global = require("../../models/global");
const { REVIEW_REWARD } = require("../../settings.json");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("review")
    .setDescription("Leave a review about the bot and earn 5000 coins!")
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("stars")
        .setDescription("What would you rate this out of 5")
        .setRequired(true)
        .setMaxValue(5)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("positive")
        .setDescription("Name one positive feature about this bot")
        .setRequired(true)
        .setMaxLength(50)
    )
    .addStringOption((option) =>
      option
        .setName("negative")
        .setDescription("Name one negative feature about this bot")
        .setRequired(true)
        .setMaxLength(50)
    )
    .addBooleanOption((option) =>
      option
        .setName("recommend")
        .setDescription("Would you recommend this bot to a friend")
        .setRequired(true)
    ),
  async execute(interaction) {
    const stars = interaction.options.getInteger("stars");
    const positive = interaction.options.getString("positive");
    const negative = interaction.options.getString("negative");
    const recommend = interaction.options.getBoolean("recommend");

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply({
          content: "You don't have a profile yet.",
          ephemeral: true,
        });
      }

      // Check if the user has had their cat for at least 2 days
      const now = new Date();
      const created = profile.created;
      const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000;

      if (now - created < twoDaysInMillis) {
        const remainingTime = new Date(created.getTime() + twoDaysInMillis);
        return interaction.reply({
          content: `You need to have your cat for at least 2 days before leaving a review. Please wait until <t:${Math.floor(
            remainingTime.getTime() / 1000
          )}:R>.`,
          ephemeral: true,
        });
      }

      // Fetch the global profile and add the review
      const globalProfile = await global.findOne({});
      if (!globalProfile) {
        return interaction.reply({
          content: "Global profile not found. Please contact an admin.",
          ephemeral: true,
        });
      }

      globalProfile.reviews.push({
        userId: interaction.user.id,
        stars,
        positive,
        negative,
        recommend,
        timestamp: now,
      });

      await globalProfile.save();

      interaction.reply({
        content: "Thank you for your review! You have earned 5000 coins.",
        ephemeral: true,
      });

      // Update user's coins
      profile.economy.coins += REVIEW_REWARD;
      profile.economy.totalCoins += REVIEW_REWARD;
      await profile.save();
    } catch (err) {
      interaction.reply({
        content: "Error with the review command!",
        ephemeral: true,
      });
      console.error(err);
    }
  },
};
