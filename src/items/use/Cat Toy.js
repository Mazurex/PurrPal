const { EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const { max_skills_value } = require("../../settings.json");

module.exports = {
  checkMaxSkill: async (profile) => {
    const cat = profile.cat[0];
    return cat.skills.strength >= max_skills_value;
  },

  use: async (interaction, itemIndex) => {
    const profile = await moneys.findOne({ userId: interaction.user.id });
    const cat = profile.cat[0];

    if (cat.skills.strength < max_skills_value) {
      cat.skills.strength += 1;

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${cat.name} has played with the cat toy`)
            .setDescription(`Strength increased by +1`),
        ],
      });

      profile.inventory[itemIndex].amount -= 1;

      if (profile.inventory[itemIndex].amount <= 0) {
        profile.inventory.splice(itemIndex, 1);
      }

      await profile.save();
    } else {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle(`${cat.name} cannot play with the cat toy`)
            .setDescription(`Strength is already at its maximum value`),
        ],
        ephemeral: true,
      });
    }
  },
};
