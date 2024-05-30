const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useItem } = require("../../handlers/itemHandler");
const moneys = require("../../models/moneys");
const items = require("../../items/items.json");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item from your inventory")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("What item do you want to use")
        .setMaxLength(35)
        .setRequired(true)
    ),
  async execute(interaction) {
    const item = interaction.options.getString("item");
    try {
      await useItem(item, interaction);
    } catch (err) {
      console.error(err);
      interaction.reply(`There was a problem with using the item \`${item}\``);
    }
  },
};
