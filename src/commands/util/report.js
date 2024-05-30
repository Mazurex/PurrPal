const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { report_channel } = require("../../settings.json");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report a user for exploting the bot ")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who are you reporting")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are you reporting them")
        .setMaxLength(250)
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("proof")
        .setDescription("Proof of this user doing this action")
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");
    const proof = interaction.options.getAttachment("proof");
    const channel = await interaction.client.channels.fetch(report_channel);

    interaction.reply({
      content: `Successfully reported ${target.username} for \`${reason}\``,
      ephemeral: true,
    });

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(`${interaction.user.username}'s report`)
      .addFields(
        { name: "Target", value: target.username, inline: false },
        { name: "Reason", value: reason, inline: false }
      );

    if (proof) {
      embed.setImage(proof.url);
    }

    channel.send({
      embeds: [embed],
    });
  },
};
