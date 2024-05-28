const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the leaderboard")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("totalcoins")
        .setDescription("View the top 15 users by total coins gained")
        .addBooleanOption((option) =>
          option.setName("guild").setDescription("Show only guild members")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("highestlevel")
        .setDescription("View the top 15 users by highest level")
        .addBooleanOption((option) =>
          option.setName("guild").setDescription("Show only guild members")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("balance")
        .setDescription("View the top 15 users by total balance (coins + bank)")
        .addBooleanOption((option) =>
          option.setName("guild").setDescription("Show only guild members")
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildOnly = interaction.options.getBoolean("guild") ?? false;

    try {
      let leaderboardData;

      if (subcommand === "totalcoins") {
        leaderboardData = await moneys
          .find({})
          .sort({ "economy.totalCoins": -1 })
          .limit(15);
      } else if (subcommand === "highestlevel") {
        leaderboardData = await moneys
          .find({})
          .sort({ "cat.level": -1 })
          .limit(15);
      } else if (subcommand === "balance") {
        leaderboardData = await moneys.aggregate([
          {
            $addFields: {
              totalBalance: {
                $add: ["$economy.coins", "$economy.bank"],
              },
            },
          },
          { $sort: { totalBalance: -1 } },
          { $limit: 15 },
        ]);
      }

      if (guildOnly) {
        const guildUserIds = interaction.guild.members.cache.map(
          (member) => member.id
        );
        leaderboardData = leaderboardData.filter((profile) =>
          guildUserIds.includes(profile.userId)
        );
      }

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle(
          subcommand === "totalcoins"
            ? "Top 15 Users by Total Coins Gained"
            : subcommand === "highestlevel"
            ? "Top 15 Users by Highest Level"
            : "Top 15 Users by Total Balance"
        );

      if (leaderboardData.length === 0) {
        embed.setDescription("No data available.");
      } else {
        leaderboardData.forEach((profile, index) => {
          const user = interaction.client.users.cache.get(profile.userId);
          const username = user ? user.username : "Unknown User";

          if (subcommand === "totalcoins") {
            embed.addFields({
              name: `\`${index + 1}.\` \`${username}\``,
              value: `${profile.economy.totalCoins}`,
              inline: true,
            });
          } else if (subcommand === "highestlevel") {
            embed.addFields({
              name: `\`${index + 1}.\` \`${username}\``,
              value: `Level ${profile.cat[0].level}`,
              inline: true,
            });
          } else if (subcommand === "balance") {
            embed.addFields({
              name: `\`${index + 1}.\` \`${username}\``,
              value: `${profile.totalBalance}`,
              inline: false,
            });
          }
        });
      }

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error fetching the leaderboard.",
        ephemeral: true,
      });
    }
  },
};
