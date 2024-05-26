const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money to your bank")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How much money you want to deposit")
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (profile.economy.coins < amount)
        return interaction.reply({
          content: "You do not have that many coins!",
          ephemeral: true,
        });

      profile.economy.coins -= amount;
      profile.economy.bank += amount;

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${interaction.user.username} depostied coins to their bank`)
        .setDescription(
          `You have depostied \`${amount}\` coins to your bank, your balance is now \`${profile.economy.coins}\`, your bank balance is now \`${profile.economy.bank}\``
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({
        content: "Error with depositing coins!",
        ephemeral: true,
      });
      console.log(err);
    }
  },
};
