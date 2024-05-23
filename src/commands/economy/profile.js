const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Display your profile")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("What category should be opened")
        .addChoices(
          { name: "Main", value: "main" },
          { name: "Skills", value: "skills" },
          { name: "Inventory", value: "inventory" }
        )
    ),
  async execute(interaction) {
    const category = interaction.options.getString("category") ?? "main";

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      const cat = profile.cat[0];

      if (category === "main") {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${interaction.user.username}'s profile`)
          .addFields(
            {
              name: "Balance",
              value: profile.economy.coins.toString(),
              inline: true,
            },
            {
              name: "Level",
              value: cat.level.toString(),
              inline: true,
            },
            {
              name: "XP",
              value: `${cat.xp} / ${Math.floor((cat.level * 2 + 5) / 0.15)}`,
            }
          );
        interaction.reply({ embeds: [embed] });
      } else if (category === "skills") {
        // ...
      } else if (category === "inventory") {
        // ...
      }
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "There was a problem with fetching user data",
        ephemeral: true,
      });
    }
  },
};
