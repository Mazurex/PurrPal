const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Hunt for a chance of winning some coins!")
    .addStringOption((option) =>
      option
        .setName("option")
        .setDescription("What setting do you want to change")
        .setRequired(true)
        .addChoices({ name: "Disable Robbery", value: "disable_rob" })
    )
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("The value of the rule you want to change")
    ),
  async execute(interaction) {
    const option = interaction.options.getString("option");
    const value = interaction.optinos.getString("value").toLowerCase();

    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (option === "disable_rob") {
        const TrueOptions = ["true", "t"];
        const FalseOptions = ["false", "f"];

        if (value != TrueOptions || value != FalseOptions) {
          return interaction.reply({
            content: "Please set the value to the correct format!",
            ephemeral: true,
          });
        }

        if (value === TrueOptions) {
          profile.disabled.disabledRobbing = true;
          interaction.reply({
            content: `I have disabled robbing for your profile!`,
          });
        } else {
          profile.disabled.disabledRobbing = false;
          interaction.reply({
            content: `I have enabled robbing for your profile!`,
          });
        }

        await profile.save();
      }
    } catch (err) {
      interaction.reply({
        content: "Error with settings command",
        ephemeral: true,
      });
      console.log(err);
    }
  },
};
