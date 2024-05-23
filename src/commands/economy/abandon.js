const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 1800,
  data: new SlashCommandBuilder()
    .setName("abandon")
    .setDescription("Abandon your cat (clearing your progress)")
    .addStringOption((option) =>
      option
        .setName("confirmation")
        .setDescription("Enter the name of your cat to confirm deletion")
        .setRequired(true)
    ),
  async execute(interaction) {
    const catName = interaction.options.getString("confirmation");
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (!profile || !profile.cat.some((cat) => cat.name === catName)) {
        return interaction.reply({
          content:
            "Invalid cat name. Please enter the correct name of your cat to confirm deletion",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`${interaction.user.username}'s cat has been abandoned`)
        .setDescription(
          `You have left \`${catName}\` on a random street, your whole profile has been wiped as you hear \`${catName}\` meowing for you to come back!`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await moneys.findOneAndDelete({ userId: interaction.user.id });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was a problem with abandoning your cat",
        ephemeral: true,
      });
    }
  },
};
