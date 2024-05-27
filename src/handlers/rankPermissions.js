const moneys = require("../models/moneys");
const rankPermissions = {
  Noob: [],
  Media: [],
  Dev: ["Admin"],
  Mod: ["Admin"],
};

async function hasPermission(interaction, category) {
  try {
    const profiles = await moneys.findOne({ userId: interaction.user.id });

    if (!profiles) {
      return;
    }

    const rank = profiles.rank;

    const rankName = rankNames[rank];
    return rankPermissions[rankName]?.includes(category);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  hasPermission,
};
