const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const moneys = require("../../models/moneys");
const bankTier = require("../../handlers/bankTier");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bank")
    .setDescription("Show your bank data")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Check a specific user's bank data")
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target") ?? interaction.user;
    try {
      const profile = await moneys.findOne({ userId: target.id });

      if (!profile) {
        return interaction.reply({
          content: "This user has not yet adopted a cat!",
          ephemeral: true,
        });
      }

      const currentTier = profile.economy.bankTier;
      const tierLimit = bankTier(currentTier);
      const nextTierInfo = bankTier(currentTier + 1);
      const nextTierPrice = 200; // Adjust this value as necessary

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${target.username}'s Bank Data`)
        .addFields(
          { name: "Current Tier", value: currentTier.toString(), inline: true },
          { name: "Bank Limit", value: tierLimit.toString(), inline: true },
          {
            name: "Coins in Bank",
            value: profile.economy.bank.toString(),
            inline: true,
          },
          {
            name: "Next Tier Limit",
            value: nextTierInfo ? nextTierInfo.toString() : "N/A",
            inline: true,
          },
          {
            name: "Price for Next Tier",
            value: nextTierPrice.toString(),
            inline: true,
          }
        )
        .setTimestamp();

      const upgradeButton = new ButtonBuilder()
        .setCustomId("upgradeTier")
        .setLabel("Upgrade Tier")
        .setEmoji("<:tiers:1244368717941571705>")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          nextTierInfo === null || profile.economy.coins < nextTierPrice
        );

      const row = new ActionRowBuilder().addComponents(upgradeButton);

      if (target === interaction.user) {
        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }

      const filter = (i) =>
        i.customId === "upgradeTier" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        try {
          if (nextTierInfo === null) {
            return i.reply({
              content: "You have already reached the highest tier!",
              ephemeral: true,
            });
          }

          if (profile.economy.coins < nextTierPrice) {
            return i.reply({
              content: "You do not have enough coins to upgrade!",
              ephemeral: true,
            });
          }

          profile.economy.coins -= nextTierPrice;
          profile.economy.bankTier = currentTier + 1;
          await profile.save();

          const updatedTierLimit = bankTier(profile.economy.bankTier);
          const nextUpdatedTierInfo = bankTier(profile.economy.bankTier + 1);

          const updatedEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(
              `<:bank_icon:1244404825664524378> ${target.username}'s Bank Data`
            )
            .addFields(
              {
                name: "Current Tier",
                value: profile.economy.bankTier.toString(),
                inline: true,
              },
              {
                name: "Bank Limit",
                value: updatedTierLimit.toString(),
                inline: true,
              },
              {
                name: "Coins in Bank",
                value: profile.economy.bank.toString(),
                inline: true,
              },
              {
                name: "Next Tier Limit",
                value: `<:tiers:1244368717941571705> ${
                  nextUpdatedTierInfo ? nextUpdatedTierInfo.toString() : "N/A"
                }`,
                inline: true,
              },
              {
                name: "Price for Next Tier",
                value: nextTierPrice.toString(),
                inline: true,
              }
            )
            .setTimestamp();

          await i.update({ embeds: [updatedEmbed], components: [] });
          i.followUp({
            content: `Successfully upgraded to Tier ${profile.economy.bankTier}!`,
            ephemeral: true,
          });
        } catch (err) {
          console.error(err);
          i.reply({
            content: "There was an error processing your upgrade!",
            ephemeral: true,
          });
        }
      });
    } catch (err) {
      console.error(err);
      interaction.reply("There was an error with checking your bank data!");
    }
  },
};

/*
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const moneys = require("../../models/moneys");
const bankTier = require("../../handlers/bankTier");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("bank")
    .setDescription("Show your bank data")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("check a specific users bank data")
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target") ?? interaction.user;
    try {
      const profile = await moneys.findOne({ userId: target.id });

      if (!profile) {
        return interaction.reply({
          content: "This user has not yet adopted a cat!",
          ephemeral: true,
        });
      }

      const currentTier = profile.economy.bankTier;
      const tierLimit = bankTier(currentTier);
      const nextTierInfo = bankTier(currentTier + 1);
      const nextTierPrice = 200;

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${target.username}'s bank data`)
        .addFields(
          { name: "Current tier", value: currentTier.toString(), inline: true },
          { name: "Bank Limit", value: tierLimit.toString(), inline: true },
          {
            name: "Coins in bank",
            value: profile.economy.bank.toString(),
            inline: true,
          },
          { name: "Next tier limit", value: nextTierInfo.toString() },
          {
            name: "Price for next tier",
            value: nextTierPrice.toString(),
            inline: true,
          }
        )
        .setTimestamp();

      const upgradeButton = new ButtonBuilder()
        .setCustomId("upgradeTier")
        .setLabel("Upgrade tier")
        .setEmoji("<:tiers:1244368717941571705>")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          nextTierInfo === null || profile.economy.coins < nextTierPrice
        );

      const row = new ActionRowBuilder().addComponents(upgradeButton);

      if (target === interaction.user) {
        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }

      const filter = (i) =>
        i.customId === "upgradeTier" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60_000,
      });

      collector.on("collect", async (i) => {
        if (nextTierInfo === null) {
          return i.reply({
            content: "You have already reached the highest tier!",
            ephemeral: true,
          });
        }

        if (profile.economy.coins < nextTierPrice) {
          return i.reply({
            content: "You do not have enough coins to upgrade!",
            ephemeral: true,
          });
        }

        profile.economy.coins -= nextTierInfo.cost;
        profile.bankTier = currentTier + 1;
        await profile.save();

        const updateEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${target.username}'s bank data`)
          .addFields(
            {
              name: "Current tier",
              value: currentTier.toString(),
              inline: true,
            },
            { name: "Bank Limit", value: tierLimit.toString(), inline: true },
            {
              name: "Coins in bank",
              value: profile.economy.bank.toString(),
              inline: true,
            },
            { name: "Next tier limit", value: nextTierInfo.toString() },
            { name: "Price for next tier", value: nextTierPrice.toString() }
          )
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: [] });
        i.followUp({
          content: `Successfully upgraded to \`Tier ${profile.economy.bankTier}\`!`,
        });
      });
    } catch (err) {
      console.error(err);
      interaction.reply("There was an error with checking your bank data!");
    }
  },
};

*/
