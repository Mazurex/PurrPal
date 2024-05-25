const Discord = require("discord.js");
const global = require("../models/global");
const moneys = require("../models/moneys");
const drawLottery = require("../handlers/lotteryScheduler");
const schedule = require("node-schedule");

module.exports = {
  name: Discord.Events.ClientReady,
  once: false,
  async execute(client) {
    console.log(`----[ Logged in as ${client.user.tag} ]----`);

    schedule.scheduleJob("0 0 * * *", () => drawLottery(client));

    try {
      const totalGuilds = client.guilds.cache.size ?? 0;
      const totalCats = (await moneys.countDocuments({})) ?? 0;

      await global.findOneAndUpdate(
        {},
        {
          $setOnInsert: {
            guilds: [],
            totalGuilds: totalGuilds,
            totalCats: totalCats,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.log("Error creating global db: ", err);
    }
  },
};
