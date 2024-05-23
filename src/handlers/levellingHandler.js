const moneys = require("../models/moneys");

class LevellingHandler {
  constructor(xpToGive, userId, interaction) {
    this.xpToGive = xpToGive;
    this.userId = userId;
  }

  async handle() {
    try {
      const profile = await moneys.findOne({ userId: this.userId });

      profile.cat.forEach((cat) => {
        cat.xp += this.xpToGive;

        const levelUpMultiplier = Math.floor((cat.level * 2 + 5) / 0.15);
        if (cat.xp >= levelUpMultiplier) {
          cat.xp -= levelUpMultiplier;
          cat.level++;

          if (cat.level % 5 === 0) {
            const skills = Object.keys(cat.skills);
            const randomSkillIndex = Math.floor(Math.random() * skills.length);
            const randomSkill = skills[randomSkillIndex];
            cat.skills[randomSkill] += 1;

            interaction.channel.send({
              content: `${interaction.user} you have levelled up to level \`${cat.level}\`, level is a multiple of 5, +1 skill point to ${randomSkill}`,
            });
          } else {
            interaction.channel.send({
              content: `${interaction.user} you have levelled up to level \`${cat.level}\`!`,
            });
          }
        }
      });

      await profile.save();
    } catch (err) {
      console.error("Error handling levelling:", err);
    }
  }
}

module.exports = LevellingHandler;
