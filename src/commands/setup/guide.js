const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

const introEmbed = new EmbedBuilder()
  .setColor("Green")
  .setTitle("Guide: Introduction")
  .setDescription(
    `Welcome to the ultimate cat lover's bot! Our bot is designed to bring joy and fun to your Discord server with a plethora of cat-themed features and activities.
    Whether you're looking to adopt a virtual cat, play games, or earn virtual currency, we have it all.\n\n
    What sets us apart? Unlike other bots, we are completely free to use, offering premium features without any cost.\
    Dive into the world of cats and discover all the pawsome features our bot has to offer!`
  )
  .setTimestamp();

const commandEmbed = new EmbedBuilder()
  .setColor("Green")
  .setTitle("Guide: Commands")
  .setDescription(
    "PurrPall has __many__ commands that you are able to use! However we will only go over all economy commands as they are the main commands you will use!"
  )
  .addFields(
    {
      name: "Adopt {name}",
      value: "Adopt a cat, allowing you to use the economy features!",
    },
    {
      name: "Abandon {confirmation}",
      value: "Abandon your cat, resetting your progress",
    },
    { name: "Balance (target)", value: "View your / others balance" },
    { name: "Bank View (target)", value: "View your / others bank" },
    {
      name: "Bank Deposit",
      value: "Deposit money into your bank to ensure it doesn't get lost",
    },
    {
      name: "Bank Withdraw",
      value: "Withdraw money from your bank so you can spend it",
    },
    { name: "Beg", value: "Beg strangers for coins" },
    { name: "Daily", value: "Gain daily coins" },
    {
      name: "Gamble",
      value:
        "Gamble for coins, possibly giving you a chance of winning, or losing everything",
    },
    {
      name: "Gift Items {target} {item} {amount} (gift message)",
      value: "Gift an item(s) to another member",
    },
    {
      name: "Gift Coins {target} {amount} (gift message)",
      value: "Gift coins to another member",
    },
    {
      name: "Hunt",
      value:
        "Embrace your inner cat and hunt, possibly gaining coins and items",
    },
    { name: "Leaderboard", value: "View the leaderboard" },
    {
      name: "Profile Main (target)",
      value: "View your/others main profile data",
    },
    { name: "Profile Skills (target)", value: "View your/others skills" },
    { name: "Profile Inventory (target)", value: "View your/others inventory" },
    {
      name: "Review",
      value:
        "Leave a review of the bot, allowing us to improve its functionality",
    },
    {
      name: "Rob {target}",
      value: "Rob another user, stealing some of their money",
    },
    { name: "Settings", value: "Customise your experience with the bot" },
    { name: "Shop Buy {item}", value: "Buy a specific item from the shop" },
    { name: "Shop View (page)", value: "View the shop" },
    { name: "Shop Sell {item}", value: "Sell an item to the shop" },
    { name: "Shop item {item}", value: "View a specific item in the shop" },
    { name: "Use", value: "Use an item from your inventory" }
  )
  .setTimestamp();

const rankEmbed = new EmbedBuilder();
const itemEmbed = new EmbedBuilder();
const skillEmbed = new EmbedBuilder();

const selectMenu = new StringSelectMenuBuilder()
  .setCustomId("select-page")
  .setPlaceholder("Choose a page")
  .addOptions([
    {
      label: "Introduction",
      description: "View the introduction to the bot",
      value: "intro",
    },
    {
      label: "Commands",
      description: "View the commands the bot offers",
      value: "commands",
    },
    {
      label: "Ranks",
      description: "View all the ranks that are accessible",
      value: "ranks",
    },
    {
      label: "Items",
      description: "View all the items that the bot has",
      value: "items",
    },
    {
      label: "Skills",
      description: "View the skills that you have",
      value: "skills",
    },
  ]);

const row = new ActionRowBuilder().addComponents(selectMenu);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guide")
    .setDescription("Guide on how to use the bot")
    .addStringOption((option) =>
      option
        .setName("page")
        .setDescription("View a specific page")
        .addChoices(
          { name: "Introduction", value: "intro" },
          { name: "Commands", value: "commands" },
          { name: "Ranks", value: "ranks" },
          { name: "Items", value: "items" },
          { name: "skills", value: "skills" }
        )
    ),
  async execute(interaction) {
    const page = interaction.options.getString("page") ?? "intro";

    if (page === "intro") {
      await interaction.reply({ embeds: [introEmbed], components: [row] });
    } else if (page === "commands") {
      await interaction.reply({ embeds: [commandEmbed], components: [row] });
    } else if (page === "ranks") {
      await interaction.reply({ embeds: [rankEmbed], components: [row] });
    } else if (page === "items") {
      await interaction.reply({ embeds: [itemEmbed], components: [row] });
    } else if (page === "skills") {
      await interaction.reply({ embeds: [skillEmbed], components: [row] });
    }

    const filter = (i) =>
      i.customId === "select-page" && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60_000,
    });

    collector.on("collect", async (i) => {
      if (i.values[0] === "intro") {
        await i.update({ embeds: [introEmbed], components: [row] });
      } else if (i.values[0] === "commands") {
        await i.update({ embeds: [commandEmbed], components: [row] });
      } else if (i.values[0] === "ranks") {
        await i.update({ embeds: [rankEmbed], components: [row] });
      } else if (i.values[0] === "items") {
        await i.update({ embeds: [itemEmbed], components: [row] });
      } else if (i.values[0] === "skills") {
        await i.update({ embeds: [skillEmbed], components: [row] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: "You did not select any page in time.",
          ephemeral: true,
        });
      }
    });
  },
};
