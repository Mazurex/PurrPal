const path = require("path");
const moneys = require("../models/moneys");

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
      await item.use(interaction);

      profile.inventory[itemIndex].amount -= 1;

      if (profile.inventory[itemIndex].amount <= 0) {
        profile.inventory.splice(itemIndex, 1);
      }

      await profile.save();
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
