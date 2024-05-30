const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coins")
    .setDescription(
      "Admin command to add or remove coins from a user's balance"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add coins to a user's balance")
        .addStringOption((option) =>
          option
            .setName("userid")
            .setDescription("The ID of the user")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove coins from a user's balance")
        .addStringOption((option) =>
          option
            .setName("userid")
            .setDescription("The ID of the user")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to remove")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.options.getString("userid");
    const amount = interaction.options.getInteger("amount");

    try {
      const profile = await moneys.findOne({ userId: userId });

      if (!profile) {
        return interaction.reply({
          content: `User with ID ${userId} does not exist in the database.`,
          ephemeral: true,
        });
      }

      if (subcommand === "add") {
        // Add coins to the user's balance
        profile.economy.coins += amount;

        interaction.reply({
          content: `Successfully added ${amount} coins to <@${userId}>'s balance.`,
          ephemeral: true,
        });
      } else if (subcommand === "remove") {
        // Check if the user has enough coins to remove
        if (profile.economy.coins < amount) {
          return interaction.reply({
            content: `User with ID ${userId} does not have enough coins to remove.`,
            ephemeral: true,
          });
        }

        // Remove coins from the user's balance
        profile.economy.coins -= amount;

        interaction.reply({
          content: `Successfully removed ${amount} coins from <@${userId}>'s balance.`,
          ephemeral: true,
        });
      }

      // Save the updated profile
      await profile.save();
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem updating the user's balance.",
        ephemeral: true,
      });
    }
  },
};