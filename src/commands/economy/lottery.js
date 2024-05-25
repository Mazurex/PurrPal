const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const global = require("../../models/global");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("lottery")
    .setDescription(
      "Buy a lottery ticket for 250 coins and have a chance to win a huge payout!"
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Choose your 4-digit lottery number (0001-9999)")
        .setMinValue(1)
        .setMaxValue(9999)
        .setRequired(true)
    ),
  async execute(interaction) {
    const number = interaction.options.getInteger("number");
    const userId = interaction.user.id;

    try {
      const globalData = await global.findOne();

      const userTickets = globalData.lottery.filter(
        (ticket) => ticket.userId === userId
      );
      if (userTickets.length >= 20) {
        return interaction.reply({
          content:
            "You have already reached the maximum number of tickets (20) for today.",
          ephemeral: true,
        });
      }

      // Add the new ticket
      globalData.lottery.push({ userId, ticketNumber: number });
      await globalData.save();

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${interaction.user.username}'s lottery ticket purchase`)
        .setDescription(
          `You have purchased a lottery ticket with the number ${number}. Good luck!`
        );

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Error purchasing lottery ticket:", err);
      interaction.reply({
        content: "Error with purchasing lottery tickets",
        ephemeral: true,
      });
    }
  },
};
