const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const loadItems = require("../../handlers/loadItems");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Admin command to add items to a user's inventory")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("The ID of the user")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("item").setDescription("The item to add").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of the item to add")
        .setRequired(true)
    ),
  async execute(interaction) {
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

      // Check if the user already has this item in their inventory
      const existingItem = profile.inventory.find(
        (item) => item.name === itemName
      );

      if (existingItem) {
        // Update the amount if the item already exists
        existingItem.amount += amount;
      } else {
        // Add the new item to the inventory
        profile.inventory.push({ name: itemName, amount: amount });
      }

      // Save the updated profile
      await profile.save();

      interaction.reply({
        content: `Successfully added ${amount} ${itemName}(s) to <@${userId}>'s inventory.`,
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem updating the user's inventory.",
        ephemeral: true,
      });
    }
  },
};
