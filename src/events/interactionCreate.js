const { cooldowns, handleCooldown } = require("../handlers/cooldownHandler");
const checkProfile = require("../middleware/checkProfile");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    const hasProfile = await checkProfile(interaction, command);
    if (!hasProfile) return;

    const cooldown = handleCooldown(command, interaction.user, cooldowns);
    if (cooldown > 0) {
      const cooldownTimestamp =
        Math.floor(Date.now() / 1000) + Math.ceil(cooldown); // Current time + cooldown in seconds
      return interaction.reply(
        `You can use the \`${command.data.name}\` command again <t:${cooldownTimestamp}:R>`
      );
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
