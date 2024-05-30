const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const loadItems = require("../../handlers/loadItems");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminitem")
    .setDescription(
      "Admin command to add or remove items from a user's inventory"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add items to a user's inventory")
        .addStringOption((option) =>
          option
            .setName("userid")
            .setDescription("The ID of the user")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item to add")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of the item to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove items from a user's inventory")
        .addStringOption((option) =>
          option
            .setName("userid")
            .setDescription("The ID of the user")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("The item to remove")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of the item to remove")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.options.getString("userid");
    const itemName = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount");

    // Load items from the items.json file
    const itemsData = loadItems();

    // Check if the item exists
    if (!itemsData[itemName]) {
      return interaction.reply({
        content: `The item "${itemName}" does not exist.`,
        ephemeral: true,
      });
    }

    try {
      const profile = await moneys.findOne({ userId: userId });

      if (!profile) {
        return interaction.reply({
          content: `User with ID ${userId} does not exist in the database.`,
          ephemeral: true,
        });
      }

      // Check if the user has this item in their inventory
      const existingItem = profile.inventory.find(
        (item) => item.name === itemName
      );

      if (subcommand === "add") {
        // Update the amount if the item already exists or add the item to the inventory
        if (existingItem) {
          existingItem.amount += amount;
        } else {
          profile.inventory.push({ name: itemName, amount: amount });
        }

        interaction.reply({
          content: `Successfully added ${amount} ${itemName}(s) to <@${userId}>'s inventory.`,
          ephemeral: true,
        });
      } else if (subcommand === "remove") {
        // Check if the user has enough of the item to remove
        if (!existingItem || existingItem.amount < amount) {
          return interaction.reply({
            content: `User does not have enough of the item "${itemName}" to remove.`,
            ephemeral: true,
          });
        }

        // Update the amount or remove the item if the amount is 0
        existingItem.amount -= amount;
        if (existingItem.amount <= 0) {
          profile.inventory = profile.inventory.filter(
            (item) => item.name !== itemName
          );
        }

        interaction.reply({
          content: `Successfully removed ${amount} ${itemName}(s) from <@${userId}>'s inventory.`,
          ephemeral: true,
        });
      }

      // Save the updated profile
      await profile.save();
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem updating the user's inventory.",
        ephemeral: true,
      });
    }
  },
};
