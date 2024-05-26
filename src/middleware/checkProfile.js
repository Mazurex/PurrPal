const Profile = require("../models/moneys");
const applyInterest = require("./interest");

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

    const interest = await applyInterest(interaction.user.id);

    if (interest > 0) {
      interaction.channel.send({
        content: `${interaction.user} you have recieved \`${interest}\` coins in interest from your bank! Your bank now has \`${profile.economy.bank}\` coins!`,
      });
    }

    return true;
  } catch (err) {
    console.error(err);
  }
};
