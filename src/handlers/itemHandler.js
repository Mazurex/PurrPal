const path = require("path");
const moneys = require("../models/moneys");
const { max_skills_value } = require("../settings.json");

module.exports.useItem = async (itemName, interaction) => {
  try {
    const profile = await moneys.findOne({ userId: interaction.user.id });

    if (!profile) {
      throw new Error("User profile not found.");
    }

    const itemIndex = profile.inventory.findIndex(
      (item) => item.name === itemName
    );

    if (itemIndex === -1 || profile.inventory[itemIndex].amount <= 0) {
      await interaction.reply({
        content: `You do not have any \`${itemName}\` to use.`,
        ephemeral: true,
      });
      return;
    }

    const itemPath = path.resolve(
      __dirname,
      "..",
      "items",
      "use",
      `${itemName}.js`
    );

    const item = require(itemPath);

    if (item && typeof item.use === "function") {
      const maxSkillReached = await item.checkMaxSkill(profile);
      if (maxSkillReached) {
        await interaction.reply({
          content: `Your skill is already at its maximum value. You cannot use \`${itemName}\`.`,
          ephemeral: true,
        });
        return;
      }

      await item.use(interaction, itemIndex);
    } else {
      throw new Error(
        `The item "${itemName}" does not have a valid use function.`
      );
    }
  } catch (err) {
    console.error(`Error using item "${itemName}": ${err}`);
    throw new Error(`There was an error using the item "${itemName}".`);
  }
};
