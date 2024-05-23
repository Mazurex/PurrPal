const { Collection } = require("discord.js");

const cooldowns = new Collection();

const handleCooldown = (command, user, cooldowns) => {
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(user.id)) {
    const expirationTime = timestamps.get(user.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return timeLeft;
    }
  }

  timestamps.set(user.id, now);
  setTimeout(() => timestamps.delete(user.id), cooldownAmount);
  return 0;
};

module.exports = { cooldowns, handleCooldown };
