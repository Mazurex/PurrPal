const { SlashCommandBuilder } = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Hunt for a chance of winning some coins!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("robbing")
        .setDescription("Do you want to disable/enable robbing (passive mode)")
        .addBooleanOption((option) =>
          option
            .setName("value")
            .setDescription("False = robbing disabled")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "robbing") {
      const value = interaction.options.getBoolean("value");
      try {
        const profile = await moneys.findOne({ userId: interaction.user.id });

        if (value === false) {
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
      } catch (err) {
        interaction.reply({
          content: "Error with settings command",
          ephemeral: true,
        });
        console.log(err);
      }
    }
  },
};
