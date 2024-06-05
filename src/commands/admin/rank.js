const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const {
  giveRank,
  removeRank,
  getRankDisplay,
} = require("../../handlers/rankHandler");

const global = require("../../models/global");

// Rank names mapping
const rankNames = {
  0: "Banned",
  1: "Member",
  2: "Media",
  3: "Mod",
  4: "Dev",
  5: "Owner",
};

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
            .setDescription("Who should this rank be removed from")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("rank")
            .setDescription("What rank should be removed")
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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const subcommand = interaction.options.getSubcommand();

    try {
      const globalData = await global.findOne();
      const userRankEntry = globalData.userRanks.find(
        (userRank) => userRank.userId === target.id
      );

      if (
        !globalData.userRanks.find(
          (userRank) => userRank.userId === interaction.user.id
        )
      ) {
        if (userRankEntry && userRankEntry.ranks.includes(4)) {
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
      }

      if (subcommand === "give") {
        const rank = interaction.options.getInteger("rank");
        await giveRank(target.id, rank);

        interaction.reply({
          content: `I have given the ${rankNames[rank]} rank to ${target.username}`,
          ephemeral: true,
        });

        try {
          target.send({
            content: `You have been given the ${rankNames[rank]} rank for PurrPal!`,
          });
        } catch {}
      } else if (subcommand === "remove") {
        const rank = interaction.options.getInteger("rank");
        await removeRank(target.id, rank);

        const display = await getRankDisplay(target.id);
        interaction.reply({
          content: `I have removed the ${rankNames[rank]} rank from ${target.username}. Current rank(s): ${display}`,
          ephemeral: true,
        });

        try {
          target.send({
            content: `Your ${rankNames[rank]} rank has been removed. Current rank(s): ${display} for PurrPal!`,
          });
        } catch {}
      }
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error with posting an update",
        ephemeral: true,
      });
    }
  },
};
