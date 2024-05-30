const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const global = require("../../models/global");
const moneys = require("../../models/moneys");
const { giveRank } = require("../../handlers/rankHandler");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user/guild from the bot")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("ban a specific user from the bot")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who should be banned")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why should this user be banned")
            .setMaxLength(50)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("wipe")
            .setDescription("Should the users profile be wiped?")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("guild")
        .setDescription("ban a specific guild from the bot")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("What guild should be banned")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why should this guild be banned")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    const reason = interaction.options.getString("reason");

    try {
      const globalData = await global.findOne();

      if (subcommand === "user") {
        const target = interaction.options.getUser("target");
        const wipe = interaction.options.getBoolean("wipe") ?? false;

        if (globalData.banned.find((banned) => banned.userId === target.id)) {
          return interaction.reply({
            content: "This user is already banned from the bot!",
            ephemeral: true,
          });
        }

        globalData.banned.push({
          userId: target.id,
          staffId: interaction.user.id,
          reason: reason,
          date: Date.now(),
        });

        if (wipe) {
          await moneys.findOneAndDelete({ userId: interaction.user.id });
        }

        giveRank(target.id, 0);

        await globalData.save();

        interaction.reply({
          content: `I have botbanned \`${target.username}\` for \`${reason}\``,
          ephemeral: true,
        });

        try {
          target.send(
            `You have been banned from using PurrPal for \`${reason}\`! If you believe this is incorrect, appeal to get unbanned in the support server!`
          );
        } catch {}
      } else if (subcommand === "guild") {
        const target = interaction.options.getString("target");
        if (
          globalData.bannedGuild.find((banned) => banned.guildId === target)
        ) {
          return interaction.reply({
            content: "This guild is already banned from the bot!",
            ephemeral: true,
          });
        }

        globalData.bannedGuild.push({
          guildId: target,
          staffId: interaction.user.id,
          reason: reason,
          date: Date.now(),
        });

        await globalData.save();

        interaction.reply({
          content: `I have botbanned the guild \`${target}\` for \`${reason}\``,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "Error with the ban command!",
        ephemeral: true,
      });
    }
  },
};
