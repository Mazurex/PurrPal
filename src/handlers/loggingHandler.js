const { EmbedBuilder } = require("discord.js");
const { logging_channel, admin_logging_channel } = require("../settings.json");

const logging = async (interaction, command) => {
  if (command.category !== "admin") {
    const channel = await interaction.client.channels.fetch(logging_channel);
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("Command logging")
          .addFields(
            {
              name: "User",
              value: `${interaction.user.username}`,
              inline: true,
            },
            {
              name: "Command",
              value: `${interaction.commandName}`,
              inline: true,
            },
            { name: "Guild", value: `${interaction.guild}`, inline: true },
            {
              name: "Guild ID",
              value: `${interaction.guild.id}`,
              inline: true,
            },
            {
              name: "Channel ID",
              value: `${interaction.channel.id}`,
              inline: true,
            },
            { name: "User ID", value: `${interaction.user.id}`, inline: true }
          )
          .setTimestamp(),
      ],
    });
  } else {
    const channel = await interaction.client.channels.fetch(logging_channel);
    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("Admin Command logging")
          .addFields(
            {
              name: "User",
              value: `${interaction.user.username}`,
              inline: true,
            },
            {
              name: "Command",
              value: `${interaction.commandName}`,
              inline: true,
            },
            {
              name: "Channel ID",
              value: `${interaction.channel.id}`,
              inline: true,
            },
            { name: "User ID", value: `${interaction.user.id}`, inline: false }
          )
          .setTimestamp(),
      ],
    });
  }
};

module.exports = { logging };
