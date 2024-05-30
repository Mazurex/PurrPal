const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const Profile = require("../models/moneys");
const global = require("../models/global");
const applyInterest = require("./interest");
const { support_server_url } = require("../settings.json");

module.exports = async (interaction, command) => {
  try {
    const globalData = await global.findOne();

    if (
      globalData.banned.find((banned) => banned.userId === interaction.user.id)
    ) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("You are banned!")
            .setDescription(
              "You have been banned from using the bot! If you believe this is unjust, appeal in the support server!"
            )
            .setTimestamp(),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Support Server")
              .setStyle(ButtonStyle.Link)
              .setURL(support_server_url)
          ),
        ],

        ephemeral: true,
      });
      return false;
    } else if (
      globalData.bannedGuild.find(
        (banned) => banned.guildId === interaction.guild.id
      )
    ) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Guild is banned")
            .setDescription(
              "This guild has been banned from using the bot! If you believe this is unjust, appeal in the support server!"
            )
            .setTimestamp(),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Support Server")
              .setStyle(ButtonStyle.Link)
              .setURL(support_server_url)
          ),
        ],

        ephemeral: true,
      });
      return false;
    }

    if (command.category === "economy") {
      const profile = await Profile.findOne({ userId: interaction.user.id });

      if (!profile || !profile.cat || profile.cat.length === 0) {
        await interaction.reply({
          content: "You need to adopt a cat before using the bot: `/adopt`",
          ephemeral: true,
        });
        return false;
      }

      const interest = await applyInterest(interaction.user.id);

      if (interest > 0) {
        interaction.channel.send({
          content: `${interaction.user} you have recieved \`${interest}\` coins in interest from your bank! Your bank now has \`${profile.economy.bank}\` coins!`,
        });
      }
    }

    return true;
  } catch (err) {
    console.error(err);
  }
};
