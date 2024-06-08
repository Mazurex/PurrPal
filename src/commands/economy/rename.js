const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const moneys = require("../../models/moneys");
const fs = require("fs");
const path = require("path");

const loadBlockedWords = () => {
  const filePath = path.join(__dirname, "..", "..", "blockedCatNames.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
};

// Function to check if any part of the name contains a blocked word
const containsBlockedWord = (name, blockedWords) => {
  const lowerCaseName = name.toLowerCase().replace(/\s/g, "");
  const sanitizedBlockedWords = blockedWords.map((word) =>
    word.replace(/\s/g, "")
  );
  return sanitizedBlockedWords.some((word) => lowerCaseName.includes(word));
};

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("Rename your cat for 5000 coins")
    .addStringOption((option) =>
      option
        .setName("new_name")
        .setDescription("What should your cat be renamed to")
        .setRequired(true)
        .setMaxLength(25)
    ),
  async execute(interaction) {
    const newName = interaction.options.getString("new_name");
    const costToUpgrade = 5000;
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      if (profile.economy.coins < costToUpgrade) {
        return interaction.reply({
          content: "You do not have enough coins to rename your cat!",
          ephemeral: true,
        });
      }

      // Check if the new name contains blocked words
      const blockedWords = loadBlockedWords();
      if (containsBlockedWord(newName, blockedWords)) {
        return interaction.reply({
          content: "Sorry, you can't use that name for your cat.",
          ephemeral: true,
        });
      }

      if (profile.cat[0].name === newName) {
        return interaction.reply({
          content: `Your cat is already called \`${newName}\``,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`${interaction.user.username}'s renaming confirmation`)
        .setDescription(
          `Are you sure you want to spend \`${costToUpgrade}\` coins to rename your cat from \`${profile.cat[0].name}\` to \`${newName}\``
        )
        .setTimestamp();

      const yesButton = new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Success);
      const noButton = new ButtonBuilder()
        .setCustomId("no")
        .setLabel("No")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().setComponents(yesButton, noButton);

      const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      const collectionFilter = (i) => i.user.id === interaction.user.id;

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: collectionFilter,
          time: 60_000,
        });

        if (confirmation.customId === "yes") {
          profile.cat[0].name = newName;
          profile.economy.coins -= costToUpgrade;
          await profile.save();

          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`${interaction.user.username}'s cat has been renamed`)
            .setDescription(`Successfuly renamed your cat to \`${newName}\``);

          interaction.editReply({
            embeds: [embed],
            components: [],
            ephemeral: false,
          });
        } else if (confirmation.customId === "no") {
          const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`${interaction.user.username} has cancelled cat renaming`)
            .setDescription(
              `You have opted out of renaming your cat, it's name is still \`${profile.cat[0].name}\``
            );

          interaction.editReply({
            embeds: [embed],
            components: [],
            ephemeral: true,
          });
        }
      } catch (error) {
        await interaction.editReply({
          content: "Confirmation not recieved within 1 minute, cancelling",
          components: [],
        });
      }
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "There was an error with renaming your cat.",
        ephemeral: true,
      });
    }
  },
};

/*
      // Update the cat's name
      profile.cat[0].name = newName;
      profile.economy.coins -= costToUpgrade;
      await profile.save();

      interaction.reply({
        content: `Your cat has been renamed to \`${newName}\`!`,
        ephemeral: true,
      });
*/
