const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const global = require("../../models/global");
const bankTier = require("../../handlers/bankTier");
const loadItems = require("../../handlers/loadItems");
const { getRankDisplay } = require("../../handlers/rankHandler");

const { ITEMS_PER_PAGE } = require("../../settings.json");

// Function to paginate items
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
    .setName("profile")
    .setDescription("Display your profile")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("main")
        .setDescription("The main profile information")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("View a specific person's profile")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("skills")
        .setDescription("Your cat's skills")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("View a specific person's profile")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("inventory")
        .setDescription("Your inventory")
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("The page number of the inventory")
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("View a specific person's profile")
        )
    ),
  async execute(interaction) {
    const category = interaction.options.getSubcommand();
    const targetUser =
      interaction.options.getUser("target") ?? interaction.user;
    const itemsData = loadItems();

    try {
      const profile = await moneys.findOne({ userId: targetUser.id });
      const globalData = await global.findOne();

      if (!profile) {
        return interaction.reply({
          content: "This user has not yet created a profile!",
          ephemeral: true,
        });
      }

      const cat = profile.cat[0];

      if (category === "main") {
        const { highestRank, allRanks } = await getRankDisplay(targetUser.id);

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${highestRank} ${targetUser.username}'s profile`)
          .addFields(
            {
              name: "Balance",
              value: `<:coin:1243888785025138749> ${profile.economy.coins}`,
              inline: true,
            },
            {
              name: "Bank Balance",
              value: `<:bank:1244368716066455712> [ ${
                profile.economy.bank
              } / ${bankTier(profile.economy.bankTier)} ]`,
              inline: true,
            },
            {
              name: "Bank Tier",
              value: `<:tiers:1244368717941571705> Tier ${profile.economy.bankTier}`,
              inline: true,
            },
            {
              name: "Level",
              value: `[ ${cat.level} / 100 ]`,
              inline: true,
            },
            {
              name: "XP",
              value: `[ ${cat.xp} / ${Math.floor(
                (cat.level * 2 + 5) / 0.15
              )} ]`,
              inline: true,
            },
            {
              name: "Cat Name",
              value: cat.name,
              inline: true,
            },
            {
              name: "Cat Adoption ID",
              value: cat.id,
              inline: true,
            },
            {
              name: "Ranks",
              value: allRanks.length ? allRanks.join(" ") : "No ranks",
              inline: false,
            }
          );
        interaction.reply({ embeds: [embed] });
      } else if (category === "skills") {
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle(`${targetUser.username}'s skills`)
          .addFields(
            {
              name: "Strength",
              value: cat.skills.strength.toString(),
              inline: true,
            },
            {
              name: "Cuteness",
              value: cat.skills.cuteness.toString(),
              inline: true,
            },
            {
              name: "Agility",
              value: cat.skills.agility.toString(),
              inline: true,
            },
            {
              name: "Intelligence",
              value: cat.skills.intelligence.toString(),
              inline: true,
            }
          );

        interaction.reply({ embeds: [embed] });
      } else if (category === "inventory") {
        const page = interaction.options.getInteger("page") ?? 1;
        const inventory = profile.inventory;

        const { paginatedItems, totalPages } = paginateItems(
          inventory,
          page,
          ITEMS_PER_PAGE
        );

        const embed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle(`${targetUser.username}'s Inventory`)
          .setFooter({ text: `Page ${page} of ${totalPages}` });

        if (paginatedItems.length === 0) {
          embed.setDescription("No items in inventory!");
        } else {
          paginatedItems.forEach((item) => {
            const itemData = itemsData[item.name];
            if (itemData) {
              embed.addFields({
                name: `${itemData.emoji} ${item.name} - ${item.amount}`,
                value: `${itemData.type}`,
                inline: true,
              });
            }
          });
        }

        interaction.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem with fetching user data",
        ephemeral: true,
      });
    }
  },
};
