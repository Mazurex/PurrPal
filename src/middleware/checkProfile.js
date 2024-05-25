const Profile = require("../models/moneys");
const LevellingHandler = require("../handlers/levellingHandler");

module.exports = async (interaction, command) => {
  try {
    if (command.category !== "economy") {
      return true;
    }

    const profile = await Profile.findOne({ userId: interaction.user.id });

    if (!profile || !profile.cat || profile.cat.length === 0) {
      await interaction.reply({
        content: "You need to adopt a cat before using the bot: `/adopt`",
        ephemeral: true,
      });
      return false;
    }

    const cat = profile.cat[0];
    const intelligenceMultiplier = cat.skills.intelligence / 10;

    let xpToGive = 5;

    if (Math.random() <= 0.25) {
      xpToGive *= intelligenceMultiplier;
    }

    const levellingHandler = new LevellingHandler(
      xpToGive,
      interaction.user.id,
      interaction
    );
    await levellingHandler.handle();

    return true;
  } catch (err) {
    console.error(err);
  }
};
