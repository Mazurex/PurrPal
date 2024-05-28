const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moneys = require("../../models/moneys");
const global = require("../../models/global");

module.exports = {
  cooldown: 2160,
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Steal some money from a different use")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who do you want to rob")
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });
      const targetProfile = await moneys.findOne({ userId: target.id });
      const globalStuff = await global.findOne({});
      const cat = profile.cat[0];

      if (profile.disabledRobing) {
        return interaction.reply({
          content: `You have disabled robbing on your profile, if you wish to enable it, use the \`/settings\` command!`,
        });
      }

      if (!targetProfile)
        return interaction.reply({
          content: "This user does not have a cat!",
          ephemeral: true,
        });

      if (targetProfile.disabledRobing) {
        return interaction.reply({
          content: "This user has disabled robbing!",
          ephemeral: true,
        });
      }

      if (targetProfile.economy.coins <= 0)
        return interaction.reply({
          content: "That user has no coins to rob!",
          ephemeral: true,
        });

      const defaultSuccessChance = Math.random();

      const additionalChance =
        (Math.floor(Math.random() * cat.skills.strength) + 1) * 0.01;
      let finalSuccessChance = defaultSuccessChance + additionalChance;

      if (finalSuccessChance >= 0.56) {
        const stealable = targetProfile.economy.coins / 10;
        const amountToSteal = Math.floor(Math.random() * stealable) + 1;

        profile.economy.coins += amountToSteal;
        profile.economy.totalCoins += amountToSteal;
        targetProfile.economy.coins -= amountToSteal;
        globalStuff.totalStole += amountToSteal;
        globalStuff.totalRobberies++;

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`${interaction.user.username}'s robbery result`)
          .setDescription(
            `${interaction.user} has stole \`${amountToSteal}\` coins from ${target}`
          )
          .setTimestamp();
        interaction.reply({ embeds: [embed] });

        try {
          if (Math.random() <= 0.3) {
            target.send(
              `Someone has stolen \`${amountToSteal}\` from your balance! Consider hiding your money in your bank!`
            );
          } else {
            target.send(
              `${interaction.user.username} has stolen \`${amountToSteal}\` from your balance! Consider hiding your money in your bank!`
            );
          }
        } catch {}
      } else if (finalSuccessChance >= 0.11 && finalSuccessChance < 0.56) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`${interaction.user.username}'s robbery result`)
          .setDescription(
            `${interaction.user} has stole \`0\` coins from ${target}`
          )
          .setTimestamp();
        interaction.reply({ embeds: [embed] });
      } else {
        const amountLost =
          Math.floor(Math.random() * (targetProfile.economy.coins / 10)) + 1;
        profile.economy.coins -= amountLost;

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`${interaction.user.username}'s robbery result`)
          .setDescription(
            `${interaction.user} has attempted to steal from ${target} however they failed and lost \`${amountLost}\` coins!`
          )
          .setTimestamp();
        interaction.reply({ embeds: [embed] });
      }

      await profile.save();
      await targetProfile.save();
      await globalStuff.save();
    } catch (err) {
      interaction.reply({
        content: "There was an error with this command!",
        ephemeral: true,
      });
      console.error(err);
    }
  },
};
