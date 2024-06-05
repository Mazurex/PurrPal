const global = require("../models/global");

const rankicons = {
  0: "<:banned6:1245812234538717277><:banned2:1245812228591190067><:banned3:1245812229811736649><:banned4:1245812231229276232><:banned5:1245812232781037568>", // Banned
  1: "<:member1:1245812842364538960><:member2:1245812843773820938><:member3:1245812845317324811><:member4:1245812846097334363><:member5:1245812847762739341>", // Member
  2: "<:media1:1245813208829132973><:media2:1245813210498597055><:media3:1245813211920470098><:media4:1245813213803839571>", // Media
  3: "<:mod1:1245813607296401570><:mod2:1245813608735309926><:mod3:1245813609934749777><:mod4:1245813611323064350>", // Mod
  4: "<:dev1:1245814331485196389><:dev2:1245814333036957806><:dev3:1245814334446112860><:dev4:1245814335641751674>", // Dev
  5: "<:owner1:1245992565870956614><:owner2:1245992567057813564><:owner3:1245992568290803793><:owner4:1245992569377394758><:owner5:1245992570706989108><:owner6:1245992571910492212>", // Owner
};

const giveRank = async (userid, rank) => {
  try {
    await global.findOneAndUpdate(
      { "userRanks.userId": userid },
      { $addToSet: { "userRanks.$.ranks": rank } }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to give rank");
  }
};

const removeRank = async (userid, rank) => {
  try {
    await global.findOneAndUpdate(
      { "userRanks.userId": userid },
      { $pull: { "userRanks.$.ranks": rank } }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove rank");
  }
};

const getRankDisplay = async (userId) => {
  try {
    const globalData = await global.findOne();

    const userRankEntry = globalData.userRanks.find(
      (userRank) => userRank.userId === userId
    );

    if (!userRankEntry) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const highestRank = userRankEntry.ranks.reduce(
      (highest, current) => (current > highest ? current : highest),
      0
    );

    const allRanks = userRankEntry.ranks.map((rank) => rankicons[rank]);

    return { highestRank: rankicons[highestRank], allRanks };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get rank display");
  }
};

const removeAllRanks = async (userid) => {
  try {
    await global.findOneAndUpdate(
      { "userRanks.userId": userid },
      { $set: { "userRanks.$.ranks": [] } }
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove all ranks");
  }
};

module.exports = { giveRank, removeRank, getRankDisplay, removeAllRanks };
