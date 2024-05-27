const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  disabledCommands: { type: [String], default: [] },
});

const reviewSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  stars: { type: Number, default: 5 },
  positive: { type: String, default: "none" },
  negative: { type: String, default: "none" },
  recommend: { type: Boolean, default: true },
  timestamp: { type: Date, default: null },
});

const globalSchema = new mongoose.Schema({
  guilds: [guildSchema],
  totalGuilds: { type: Number, default: 0 },
  totalCats: { type: Number, default: 0 },
  totalRobberies: { type: Number, default: 0 },
  totalStole: { type: Number, default: 0 },
  reviews: [reviewSchema],
});

module.exports = mongoose.model("Global", globalSchema);
