const Discord = require("discord.js");
const Global = require("../models/global");
const moneys = require("../models/moneys");

module.exports = {
  name: Discord.Events.ClientReady,
  once: false,
  async execute(client) {
    console.log(`----[ Logged in as ${client.user.tag} ]----`);

    try {
      const totalGuilds = client.guilds.cache.size ?? 0;
      const totalCats = (await moneys.countDocuments({})) ?? 0;

      await Global.findOneAndUpdate(
        {},
        {
          $setOnInsert: {
            guilds: [],
            totalGuilds: totalGuilds,
            totalCats: totalCats,
            reviews: [],
            totalRobberies: 0,
            totalStole: 0,
            userRanks: [],
            banned: [],
            bannedGuild: [],
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.log("Error creating global db: ", err);
    }
  },
};
