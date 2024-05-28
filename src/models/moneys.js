const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  strength: { type: Number, default: 0 },
  cuteness: { type: Number, default: 0 },
  agility: { type: Number, default: 0 },
  intelligence: { type: Number, default: 0 },
});

const catSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  id: { type: String, required: true },
  skills: skillSchema,
});

const economySchema = new mongoose.Schema({
  coins: { type: Number, default: 0 },
  totalCoins: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  bankTier: { type: Number, default: 1 },
  gamblingPass: { type: Boolean, default: false },
  lastInterest: { type: Date, default: null },
  lastDaily: { type: Date, default: null },
});

const disabledSchema = new mongoose.Schema({
  disabledRobbing: { type: Boolean, default: false },
});

const moneySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  rank: { type: Number, default: 0 },
  economy: economySchema,
  inventory: { type: Array, default: [] },
  cat: [catSchema],
  disabled: disabledSchema,
  created: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("moneys", moneySchema);
