const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const loadItems = require("../../handlers/loadItems");

const { ITEMS_PER_PAGE } = require("../../settings.json");

const paginateItems = (items, page, itemsPerPage) => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = items.slice(start, end);

  return {
    paginatedItems,
    totalPages,
  };
};

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the shop, a specific item, or buy something")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View the shop")
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("View a specific page of the shop")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("item")
        .setDescription("View a specific item in the shop")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("What item do you want to view")
            .setRequired(true)
            .setMaxLength(32)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("buy")
        .setDescription("Buy a specific item in the shop")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("What item do you want to buy")
            .setRequired(true)
            .setMaxLength(32)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sell")
        .setDescription("Sell an item in your inventory for 60% of it's price!")
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("What item do you want to use")
            .setMaxLength(35)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const itemsData = loadItems();

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile) {
        return interaction.reply({
          content: "You need to create a profile first.",
          ephemeral: true,
        });
      }

      if (subcommand === "view") {
        const page = interaction.options.getInteger("page") ?? 1;
        const shopItems = Object.keys(itemsData)
          .map((key) => ({
            name: key,
            ...itemsData[key],
          }))
          .filter((item) => item.price !== undefined);

        const { paginatedItems, totalPages } = paginateItems(
          shopItems,
          page,
          ITEMS_PER_PAGE
        );

        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Shop")
          .setFooter({ text: `Page ${page} of ${totalPages}` });

        if (paginatedItems.length === 0) {
          embed.setDescription("No items found!");
        } else {
          paginatedItems.forEach((item) => {
            embed.addFields({
              name: `${item.emoji} ${item.name}`,
              value: `> ${item.description}\n> Price: ${item.price} coins`,
              inline: true,
            });
          });
        }

        interaction.reply({ embeds: [embed] });
      } else if (subcommand === "item") {
        const itemName = interaction.options.getString("item").toLowerCase();
        const item = itemsData[itemName];

        if (!item) {
          return interaction.reply({
            content: `Item "${itemName}" not found in the shop.`,
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle(`Shop Item: ${item.emoji} ${itemName}`)
          .setDescription(item.description);

        if (item.price !== undefined) {
          embed.addFields({ name: "Price", value: `${item.price} coins` });
        } else {
          embed.addFields({ name: "Price", value: "Cannot be purchased" });
        }

        interaction.reply({ embeds: [embed] });
      } else if (subcommand === "buy") {
        const itemName = interaction.options.getString("item").toLowerCase();
        const item = itemsData[itemName];

        if (!item) {
          return interaction.reply({
            content: `Item "${itemName}" not found in the shop.`,
            ephemeral: true,
          });
        }

        if (item.price === undefined) {
          return interaction.reply({
            content: `Item "${itemName}" cannot be purchased.`,
            ephemeral: true,
          });
        }

        if (profile.economy.coins < item.price) {
          return interaction.reply({
            content: `You do not have enough coins to buy ${itemName}.`,
            ephemeral: true,
          });
        }

        profile.economy.coins -= item.price;
        profile.inventory.push({ name: itemName, amount: 1 });

        await profile.save();

        interaction.reply({
          content: `You have successfully bought ${item.emoji} ${itemName} for ${item.price} coins!`,
        });
      } else if (subcommand === "sell") {
        const itemName = interaction.options.getString("item").toLowerCase();
        const item = itemsData[itemName];

        if (!item) {
          return interaction.reply({
            content: `Item "${itemName}" not found in your inventory.`,
            ephemeral: true,
          });
        }

        const inventoryItem = profile.inventory.find(
          (invItem) => invItem.name === itemName
        );

        if (!inventoryItem || inventoryItem.amount <= 0) {
          return interaction.reply({
            content: `You do not have any "${itemName}" to sell.`,
            ephemeral: true,
          });
        }

        const sellPrice = item.price * 0.6;

        profile.economy.coins += sellPrice;
        inventoryItem.amount -= 1;

        if (inventoryItem.amount <= 0) {
          profile.inventory = profile.inventory.filter(
            (invItem) => invItem.name !== itemName
          );
        }

        await profile.save();

        interaction.reply({
          content: `You have successfully sold ${item.emoji} ${itemName} for ${sellPrice} coins!`,
        });
      }
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error with the shop command.",
        ephemeral: true,
      });
    }
  },
};
