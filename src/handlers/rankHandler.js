const global = require("../models/global");

const rankicons = {
  0: "BANNED",
  1: "MEMBER",
  2: "MEDIA",
  3: "MOD",
  4: "DEV",
};

const giveRank = async (userid, rank) => {
  try {
    const globalData = await global.findOne();

    const userRankIndex = globalData.userRanks.findIndex(
      (userRank) => userRank.userId === userid
    );

    if (userRankIndex === -1) {
      globalData.userRanks.push({
        userId: userid,
        rank: rank,
        display: rankicons[rank],
      });
    } else {
      globalData.userRanks[userRankIndex].rank = rank;
      globalData.userRanks[userRankIndex].display = rankicons[rank];
    }

    await globalData.save();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to give rank");
  }
};

const removeRank = async (userid) => {
  try {
    const globalData = await global.findOne();

    const userRankIndex = globalData.userRanks.findIndex(
      (userRank) => userRank.userId === userid
    );

    if (userRankIndex === -1) {
      globalData.userRanks.push({
        userId: userid,
        rank: 1,
        display: rankicons[1],
      });
    } else {
      globalData.userRanks[userRankIndex].rank = 1;
      globalData.userRanks[userRankIndex].display = rankicons[1];
    }

    await globalData.save();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove rank");
  }
};

module.exports = { giveRank, removeRank };
