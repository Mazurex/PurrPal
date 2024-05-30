const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const {
  giveRank,
  removeRank,
  getRankDisplay,
} = require("../../handlers/rankHandler");

const global = require("../../models/global");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Give/Remove a rank from a member")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Give a rank to a member")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who should the rank be given to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("rank")
            .setDescription("What rank should be given")
            .addChoices(
              { name: "Banned", value: 0 },
              { name: "Member", value: 1 },
              { name: "Media", value: 2 },
              { name: "Mod", value: 3 },
              { name: "Dev", value: 4 }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a rank from a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("who should this rank be given to")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const subcommand = interaction.options.getSubcommand();

    try {
      const globalData = await global.findOne();
      if (subcommand === "give") {
        const rank = interaction.options.getInteger("rank");

        const userRankEntry = globalData.userRanks.find(
          (userRank) => userRank.userId === target.id
        );

        if (userRankEntry && userRankEntry.rank === 4) {
          return interaction.reply({
            content: "I cannot change the rank of this user!",
            ephemeral: true,
          });
        }

        if (target.bot || target === interaction.user) {
          return interaction.reply({
            content: "I cannot change the rank of this user!",
            ephemeral: true,
          });
        }

        await giveRank(target.id, rank);
        const display = await getRankDisplay(target.id);

        interaction.reply({
          content: `I have given the ${display} rank to ${target.username}`,
          ephemeral: true,
        });

        try {
          target.send({
            content: `You have been given the ${display} rank for PurrPal!`,
          });
        } catch {}
      } else if (subcommand === "remove") {
        const userRankEntry = globalData.userRanks.find(
          (userRank) => userRank.userId === target.id
        );

        if (userRankEntry && userRankEntry.rank === 4) {
          return interaction.reply({
            content: "I cannot change the rank of this user!",
            ephemeral: true,
          });
        }

        if (target.bot || target === interaction.user) {
          return interaction.reply({
            content: "I cannot change the rank of this user!",
            ephemeral: true,
          });
        }

        await removeRank(target.id);
        interaction.reply({
          content: `I have resetted ${target.username}'s rank!`,
          ephemeral: true,
        });

        try {
          target.send({
            content: `Your rank has been resetted to ${getRankDisplay(
              target.id
            )} for PurrPal!`,
          });
        } catch {}
      }
    } catch (err) {
      console.error(err);
      interaction.reply("There was an error with posting an update");
    }
  },
};
