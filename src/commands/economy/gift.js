const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription("Send coins to another user!")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who do you want to send coins to")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How much you want to send")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("gift_message")
        .setDescription("Send a message along with your gift")
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const amount = interaction.options.getInteger("amount");
    const gift_message =
      interaction.options.getString("gift_message") ?? "No gift message";

    try {
      const userProfile = await moneys.findOne({ userId: interaction.user.id });
      const targetProfile = await moneys.findOne({ userId: target.id });

      if (!targetProfile) {
        return interaction.reply({
          content: "This person has not yet adopted a cat!",
          ephemeral: true,
        });
      }

      if (amount > userProfile.economy.coins) {
        return interaction.reply({
          content: "You do not have that many coins!",
          ephemeral: true,
        });
      }

      userProfile.economy.coins -= amount;
      targetProfile.economy.coins += amount;

      await userProfile.save();
      await targetProfile.save();

      interaction.reply({
        content: `Successfully gifted \`${amount} coins\` to ${target.username}`,
      });

      try {
        target.send({
          content: `You have been gifted \`${amount} coins\` in ${interaction.guild} by ${interaction.user.username}: \`${gift_message}\``,
        });
      } catch {}
    } catch (err) {
      interaction.reply({ content: "Error gifting coins", ephemeral: true });
      console.error(err);
    }
  },
};
