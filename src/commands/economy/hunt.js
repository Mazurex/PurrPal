const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("hunt")
    .setDescription("Hunt for a chance of winning some coins!"),
  async execute(interaction) {
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      const cat = profile.cat[0];

      const { agility, strength, intelligence } = cat.skills;

      const totalSkillPoint = agility + strength + intelligence; // Total = 60

      let reward = 0;

      if (totalSkillPoint < 10) {
        reward = Math.floor(Math.random() * 10) + 1;
      } else if (totalSkillPoint < 30) {
        reward = Math.floor(Math.random() * 20) + 10;
      } else if (totalSkillPoint < 50) {
        reward = Math.floor(Math.random() * 40) + 20;
      } else {
        reward = Math.floor(Math.random() * 50) + 50;
      }

      profile.economy.coins += reward;
      await profile.save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${interaction.user.username}'s hunting rewards`)
        .setDescription(
          `Your cat went on a hunt and brought back **${reward}** coins!`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({
        content: "Error with hunt command",
        ephemeral: true,
      });
      console.log(err);
    }
  },
};
