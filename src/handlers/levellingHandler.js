const moneys = require("../models/moneys");

class LevellingHandler {
  constructor(xpToGive, userId, interaction) {
    this.xpToGive = xpToGive;
    this.userId = userId;
    this.interaction = interaction;
  }

  async handle() {
    try {
      const profile = await moneys.findOne({ userId: this.userId });

      if (!profile || !profile.cat) {
        throw new Error("Profile or cats not found.");
      }

      profile.cat.forEach((cat) => {
        cat.xp += this.xpToGive;

        const levelUpMultiplier = Math.floor((cat.level * 2 + 5) / 0.15);
        if (cat.xp >= levelUpMultiplier) {
          cat.xp -= levelUpMultiplier;
          cat.level++;
          this.interaction.channel.send({
            content: `${
              this.interaction.user
            } you have levelled up to level \`${cat.level}\` and received \`${
              (500 * cat.level) / 2
            }\` coins!`,
          });
        }
      });

      await profile.save();
    } catch (err) {
      console.error("Error handling levelling:", err);
    }
  }
}

module.exports = LevellingHandler;
