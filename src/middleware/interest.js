const moneys = require("../models/moneys");
const bankTier = require("../handlers/bankTier");

const applyInterest = async (userId) => {
  const interestRate = 0.02;

  try {
    const profile = await moneys.findOne({ userId });

    if (!profile) return;

    const cat = profile.cat[0];
    const intelligenceMultiplier = cat.skills.intelligence / 10;
    let realInterestRate = interestRate * intelligenceMultiplier;
    if (realInterestRate <= 0) realInterestRate = 1;

    const now = new Date();
    let lastInterest = profile.economy.lastInterest;

    if (!lastInterest) {
      // If lastInterest is null, set it to now and return without applying interest
      profile.economy.lastInterest = now;
      await profile.save();
      return 0;
    }

    const diffTime = Math.abs(now - lastInterest);
    const diffHours = diffTime / (1000 * 60 * 60);

    // Check if 24 hours have passed
    if (diffHours >= 24 && profile.economy.bank > 0) {
      const interest = Math.floor(profile.economy.bank * realInterestRate);

      if (
        profile.economy.bank + interest >
        bankTier(profile.economy.bankTier)
      ) {
        profile.economy.coins += interest;
      } else {
        profile.economy.bank += interest;
      }
      profile.economy.lastInterest = now;
      await profile.save();

      return interest;
    }
  } catch (err) {
    console.error("Error applying interest: ", err);
  }
  return 0;
};

module.exports = applyInterest;
