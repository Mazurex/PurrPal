const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const Global = require("../models/global");
const {
  support_server_url,
  website_admincommands_page,
} = require("../settings.json");

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild) {
    try {
      let globalData = await Global.findOne();

      globalData.guilds.push({
        guildId: guild.id,
        disabledCommands: [],
      });
      globalData.totalGuilds += 1;
      await globalData.save();
      console.log(`Joined a new guild: ${guild.name}`);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Thanks for inviting me!")
        .setDescription(
          "Thank you for inviting PurrPal to your server! The bot works right away, however you are able to customise many features! You can see all the customisation settings on the PurrPal website"
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(support_server_url),
        new ButtonBuilder()
          .setDisabled(true)
          .setLabel("Setup Commands List")
          .setStyle(ButtonStyle.Link)
          .setURL(website_admincommands_page)
      );

      try {
        const owner = await guild.fetchOwner();
        await owner.send({ embeds: [embed], components: [row] });
      } catch {
        console.error("Owner not messageable, sending message to top channel.");

        const topChannel = guild.channels.cache
          .filter(
            (channel) =>
              channel.isTextBased() &&
              channel
                .permissionsFor(guild.members.me)
                .has(PermissionFlagsBits.SendMessages)
          )
          .first();

        if (topChannel) {
          await topChannel.send({ embeds: [embed], components: [row] });
        } else {
          console.error(
            "No accessible text channel found to send the message."
          );
        }
      }
    } catch (error) {
      console.error("Error adding guild:", error);
    }
  },
};
