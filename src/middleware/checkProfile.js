const Profile = require("../models/moneys");

module.exports = async (interaction, command) => {
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

  return true;
};
