const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const global = require("../../models/global");

const abandonmentMessages = [
  "You have left <%= catName %> on a random street, your whole profile has been wiped as you hear <%= catName %> meowing for you to come back!",
  "With a heavy heart, you abandon <%= catName %> under the streetlights, hoping they'll find a new home.",
  "As you leave <%= catName %> by the roadside, you feel a pang of guilt, but you know it's for the best.",
  "Leaving <%= catName %> behind, you walk away, trying to ignore their sad meows echoing in your mind.",
  "You say goodbye to <%= catName %> as you leave them near a park, knowing they'll find a new family soon.",
];

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

      // Choose a random abandonment message
      const randomIndex = Math.floor(
        Math.random() * abandonmentMessages.length
      );
      const abandonmentMessage = abandonmentMessages[randomIndex];

      // Replace <%= catName %> in the message with the actual cat name
      const formattedMessage = abandonmentMessage.replace(
        "<%= catName %>",
        catName
      );

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`${interaction.user.username}'s cat has been abandoned`)
        .setDescription(formattedMessage)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await moneys.findOneAndDelete({ userId: interaction.user.id });

      let globalData = await global.findOne();
      if (!globalData) {
        return;
      }

      globalData.totalCats -= 1;
      await globalData.save();
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was a problem with abandoning your cat",
        ephemeral: true,
      });
    }
  },
};
