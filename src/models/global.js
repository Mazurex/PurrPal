const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  disabledCommands: { type: [String], default: [] },
});

const globalSchema = new mongoose.Schema({
  guilds: [guildSchema],
  totalGuilds: { type: Number, default: 0 },
  totalCats: { type: Number, default: 0 },
});

module.exports = mongoose.model("Global", globalSchema);
