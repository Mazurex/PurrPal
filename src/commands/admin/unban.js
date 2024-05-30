const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const global = require("../../models/global");
const { removeRank } = require("../../handlers/rankHandler");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user/guild from the bot")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Unban a user from the bot")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who should be unbanned")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why should this user be unbanned")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("guild")
        .setDescription("Unban a guild from the bot")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("Which guild should be unbanned")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why should this guild be unbanned")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    try {
      const globalData = await global.findOne();

      if (subcommand === "user") {
        if (!globalData.banned.find((banned) => banned.userId === target.id)) {
          return interaction.reply({
            content: "This user is not banned!",
            ephemeral: true,
          });
        }

        globalData.banned = globalData.banned.filter(
          (banned) => banned.userId !== target.id
        );

        await globalData.save();

        interaction.reply({
          content: `I have unbanned \`${target.username}\` for \`${reason}\``,
          ephemeral: true,
        });

        try {
          target.send(`You have been unbanned from using PurrPal!`);
        } catch {}
      } else if (subcommand === "guild") {
        const target = interaction.options.getString("target");

        if (
          !globalData.bannedGuild.find((banned) => banned.guildId === target)
        ) {
          return interaction.reply({
            content: "This guild is not banned!",
            ephemeral: true,
          });
        }

        globalData.bannedGuild = globalData.bannedGuild.filter(
          (banned) => banned.guildId !== target
        );

        removeRank(target.id);

        await globalData.save();

        interaction.reply({
          content: `I have unbanned the guild \`${target}\` for \`${reason}\``,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "Error with the unban command!",
        ephemeral: true,
      });
    }
  },
};
