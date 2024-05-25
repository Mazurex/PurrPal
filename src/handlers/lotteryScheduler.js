const Global = require("../models/global");
const moneys = require("../models/moneys");

async function drawLottery(client) {
  try {
    const globalData = await Global.findOne({});

    if (!globalData.lottery.length) {
      console.log("No tickets sold. Skipping lottery draw.");
      return;
    }

    const winningNumber = globalData.winningNumber;
    const winners = globalData.lottery.filter(
      (ticket) => ticket.ticketNumber === winningNumber
    );

    const announcementChannel = await client.channels.fetch(
      globalData.announcementChannelId
    );

    if (winners.length > 0) {
      const winnerIds = winners.map((ticket) => ticket.userId);
      const prize = 100000; // Grand prize amount

      await moneys.updateMany(
        { userId: { $in: winnerIds } },
        { $inc: { "economy.coins": prize } }
      );

      // Notify winners
      winnerIds.forEach(async (userId) => {
        const user = await client.users.fetch(userId);
        user.send(
          `Congratulations! You've won the lottery with ticket number ${winningNumber} and received ${prize} coins!`
        );
      });

      if (announcementChannel) {
        announcementChannel.send(
          `The lottery has ended! The winning number is ${winningNumber}. Congratulations to the winners!`
        );
      }
    } else {
      if (announcementChannel) {
        announcementChannel.send(
          `The lottery has ended! The winning number is ${winningNumber}. Unfortunately, there were no winners this time.`
        );
      }
    }

    // Reset lottery
    globalData.lottery = [];
    globalData.winningNumber = Math.floor(Math.random() * 9999) + 1;
    await globalData.save();
  } catch (err) {
    console.error("Error drawing lottery:", err);
  }
}

module.exports = drawLottery;
