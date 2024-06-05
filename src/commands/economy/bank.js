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
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View your current bank data")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Check a specific user's bank data")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("deposit")
        .setDescription("deposit coins to your bank")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("how much you want to deposit")
            .setMaxValue(25600)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("withdraw")
        .setDescription("withdraw coins from your bank")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("how much you want to deposit")
            .setMaxValue(25600)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (subcommand === "view") {
        const target =
          interaction.options.getUser("target") ?? interaction.user;
        const currentTier = profile.economy.bankTier;
        const tierLimit = bankTier(currentTier);
        const nextTierInfo = bankTier(currentTier + 1);
        const nextTierPrice = 200; // Adjust this value as necessary

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${target.username}'s Bank Data`)
          .addFields(
            {
              name: "Current Tier",
              value: currentTier.toString(),
              inline: true,
            },
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
      } else if (subcommand === "deposit") {
        const amount = interaction.options.getInteger("amount");

        if (profile.economy.coins < amount)
          return interaction.reply({
            content: "You do not have that many coins!",
            ephemeral: true,
          });

        if (amount + profile.economy.bank > bankTier(profile.economy.bankTier))
          return interaction.reply({
            content:
              "You have reached your bank limit! You can upgrade this limit by upgrading your bank tier with `/bank`",
            ephemeral: true,
          });

        profile.economy.coins -= amount;
        profile.economy.bank += amount;

        await profile.save();

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(
            `${interaction.user.username} depostied coins to their bank`
          )
          .setDescription(
            `You have depostied \`${amount}\` coins to your bank, your balance is now \`${profile.economy.coins}\`, your bank balance is now \`${profile.economy.bank}\``
          )
          .setTimestamp();

        interaction.reply({ embeds: [embed] });
      } else if (subcommand === "withdraw") {
        const amount = interaction.options.getInteger("amount");
        if (profile.economy.bank < amount)
          return interaction.reply({
            content: "You do not have that many coins in your bank!",
            ephemeral: true,
          });

        profile.economy.coins += amount;
        profile.economy.bank -= amount;

        await profile.save();

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(
            `${interaction.user.username} withdrew coins from their bank`
          )
          .setDescription(
            `You have withdrew \`${amount}\` coins from your bank, your balance is now \`${profile.economy.coins}\`, your bank balance is now \`${profile.economy.bank}\``
          )
          .setTimestamp();

        interaction.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error with the bank command!",
        ephemeral: true,
      });
    }
  },
};
