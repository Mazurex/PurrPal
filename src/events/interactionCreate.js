const { cooldowns, handleCooldown } = require("../handlers/cooldownHandler");
const checkProfile = require("../middleware/checkProfile");
const moneys = require("../models/moneys");
const global = require("../models/global");
const LevellingHandler = require("../handlers/levellingHandler");
const { logging } = require("../handlers/loggingHandler");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    const hasProfile = await checkProfile(interaction, command);
    if (!hasProfile) return;

    const globalData = await global.findOne();
    const userRankEntry = globalData.userRanks.find(
      (rank) => rank.userId === interaction.user.id
    );
    const userRanks = userRankEntry ? userRankEntry.ranks : [0]; // Default to [0] if no ranks are found

    const rankRequirements = {
      mod: [3, 4, 5],
      admin: [4, 5],
      economy: [1, 2, 3, 4, 5],
      util: [1, 2, 3, 4, 5],
      fun: [1, 2, 3, 4, 5],
    };

    const hasRequiredRank = (requiredRanks, userRanks) => {
      return requiredRanks.some((rank) => userRanks.includes(rank));
    };

    if (
      rankRequirements[command.category] &&
      !hasRequiredRank(rankRequirements[command.category], userRanks)
    ) {
      return interaction.reply({
        content: `You do not have the required rank to use the commands in the \`${command.category}\` category`,
        ephemeral: true,
      });
    }

    const cooldown = handleCooldown(command, interaction.user, cooldowns);
    if (cooldown > 0) {
      const cooldownTimestamp =
        Math.floor(Date.now() / 1000) + Math.ceil(cooldown); // Current time + cooldown in seconds
      return interaction.reply(
        `You can use the \`${command.data.name}\` command again <t:${cooldownTimestamp}:R>`
      );
    }

    if (command.category === "economy") {
      const profile = await moneys.findOne({ userId: interaction.user.id });
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
    }

    try {
      await command.execute(interaction);
      logging(interaction, command);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
