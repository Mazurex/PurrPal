const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
});

const guildSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  disabledCommands: { type: [String], default: [] },
});

const globalSchema = new mongoose.Schema({
  guilds: [guildSchema],
  totalGuilds: { type: Number, default: 0 },
  totalCats: { type: Number, default: 0 },
  //totalEconomy
  lottery: { type: [ticketSchema], default: [] },
  winningNumber: {
    type: Number,
    default: Math.floor(Math.random() * 9999) + 1,
  },
});

module.exports = mongoose.model("Global", globalSchema);
