const mongoose = require("mongoose");

const moneySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  economy: {
    coins: { type: Number, default: 0 },
  },
  inventory: { type: Array, default: [] },
  cat: [
    {
      name: { type: String, required: true },
      level: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      id: { type: String, required: true },
      skills: {
        strength: { type: Number, default: 0 },
        cuteness: { type: Number, default: 0 },
        agility: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
      },
    },
  ],
});

module.exports = mongoose.model("moneys", moneySchema);
