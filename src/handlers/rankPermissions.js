const rankPermissions = {
  Noob: [],
  Media: [],
  Dev: ["Admin"],
  Mod: ["Admin"],
};

// Define rank names
const rankNames = {
  0: "Noob",
  1: "Media",
  2: "Dev",
  3: "Mod",
};

function hasPermission(rank, category) {
  const rankName = rankNames[rank];
  return rankPermissions[rankName]?.includes(category);
}

module.exports = {
  hasPermission,
};
