const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const loadItems = require("../../handlers/loadItems");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription("Send coins to another user!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("coins")
        .setDescription("Gift coins to another user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who do you want to send coins to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("How much you want to send")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("gift_message")
            .setDescription("Send a message along with your gift")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("items")
        .setDescription("Gift items to another user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who do you want to send items to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("item")
            .setDescription("What item do you want to send")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("How much you want to send")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("gift_message")
            .setDescription("Send a message along with your gift")
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    const target = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");
    const gift_message =
      interaction.options.getString("gift_message") ?? "No gift message";
    const itemsData = loadItems();

    try {
      const userProfile = await moneys.findOne({ userId: interaction.user.id });
      const targetProfile = await moneys.findOne({ userId: target.id });

      if (!targetProfile) {
        return interaction.reply({
          content: "This person has not yet adopted a cat!",
          ephemeral: true,
        });
      }

      if (subcommand === "coins") {
        if (amount > userProfile.economy.coins) {
          return interaction.reply({
            content: "You do not have that many coins!",
            ephemeral: true,
          });
        }

        userProfile.economy.coins -= amount;
        targetProfile.economy.coins += amount;

        await userProfile.save();
        await targetProfile.save();

        const embed = new EmbedBuilder()
          .setColor("Aqua")
          .setTitle(`${interaction.user.username}'s gift receipt`)
          .setDescription(
            `Successfully gifted \`${amount} coins\` to ${target.username}`
          )
          .setTimestamp();

        interaction.reply({ embeds: [embed] });

        try {
          target.send({
            content: `You have been gifted \`${amount} coins\` in ${interaction.guild} by ${interaction.user.username}: \`${gift_message}\``,
          });
        } catch {}
      } else if (subcommand === "items") {
        const itemName = interaction.options.getString("item");
        const itemData = itemsData[itemName];

        if (!itemData) {
          return interaction.reply({
            content: `item \`${itemName}\` not found`,
            ephemeral: true,
          });
        }

        const userInventoryItem = userProfile.inventory.find(
          (item) => item.name.toLowerCase() === itemName
        );

        if (!userInventoryItem || userInventoryItem.amount < amount) {
          return interaction.reply({
            content: `You don't have enough of the item \`${itemName}\` to gift!`,
            ephemeral: true,
          });
        }

        userInventoryItem.amount -= amount;
        if (userInventoryItem.amount === 0) {
          userProfile.inventory = userProfile.inventory.filter(
            (item) => item.name.toLowerCase() !== itemName
          );
        }

        const targetInventoryItem = targetProfile.inventory.find(
          (item) => item.name.toLowerCase() === itemName
        );

        if (targetInventoryItem) {
          targetInventoryItem.amount += amount;
        } else {
          targetProfile.inventory.push({ name: itemName, amount: amount });
        }

        await userProfile.save();
        await targetProfile.save();

        const embed = new EmbedBuilder()
          .setColor("Aqua")
          .setTitle(`${interaction.user.username}'s gift receipt`)
          .setDescription(
            `Successfully gifted \`${amount} ${itemName}\` to ${target.username}`
          )
          .setTimestamp();

        interaction.reply({ embeds: [embed] });

        try {
          await target.send({
            content: `You have been gifted \`${itemAmount}x\` \`${itemName}\` in ${interaction.guild.name} by ${interaction.user.username}: \`${gift_message}\``,
          });
        } catch {}
      }
    } catch (err) {
      interaction.reply({ content: "Error gifting coins", ephemeral: true });
      console.error(err);
    }
  },
};
