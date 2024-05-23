const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
  cooldown: 1800,
  data: new SlashCommandBuilder()
    .setName("adopt")
    .setDescription("Adopt a new cat")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("What should your cat be called")
        .setRequired(true)
        .setMaxLength(25)
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const id = `#${Math.floor(Math.random() * 1000) + 1}`;

    const blockedWords = loadBlockedWords();

    // Check if any part of the cat name contains a blocked word
    if (containsBlockedWord(name, blockedWords)) {
      return interaction.reply({
        content: "Sorry, you can't use that name for your cat.",
        ephemeral: true,
      });
    }

    const generateRandomSkillValue = () => Math.floor(Math.random() * 5) + 1;

    const skills = {
      strength: generateRandomSkillValue(),
      cuteness: generateRandomSkillValue(),
      agility: generateRandomSkillValue(),
      intelligence: generateRandomSkillValue(),
    };

    try {
      let profile = await moneys.findOne({ userId: interaction.user.id });

      if (profile && profile.cat.length > 0) {
        return interaction.reply({
          content:
            "You have already adopted a pet! If you wish to change your pet, you would need to reset your profile!",
          ephemeral: true,
        });
      }

      if (!profile) {
        // Initialize profile with default values
        profile = new moneys({
          userId: interaction.user.id,
          economy: { coins: 0 }, // Initialize economy field
          inventory: [],
          cat: [],
          nextDaily: Date.now() + 86400 * 1000,
        });
      }

      profile.cat.push({
        name: name,
        level: 0,
        xp: 0,
        id: id,
        skills: skills, // Add skills to the cat object
      });

      await profile.save();

      const adoptionEmbed = new EmbedBuilder()
        .setColor("Aqua")
        .setTitle(`${interaction.user.username}'s adoption complete🐱`)
        .setDescription(
          "Congrats on adopting a cat! Each cat is unique and comes with its own base skills!"
        )
        .addFields(
          { name: "Cat Name", value: name, inline: true },
          { name: "Adoption ID", value: id, inline: true },
          { name: "Level", value: `0`, inline: true },
          { name: "Strength", value: `${skills.strength} / 20`, inline: true },
          { name: "Cuteness", value: `${skills.cuteness} / 20`, inline: true },
          { name: "Agility", value: `${skills.agility} / 20`, inline: true },
          {
            name: "Intelligence",
            value: `${skills.intelligence} / 20`,
            inline: true,
          }
        )
        .setFooter({
          text: "Tip: use the `/guide` command to learn how to earn money and levels!",
        })
        .setTimestamp();

      await interaction.reply({ embeds: [adoptionEmbed] });
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content:
          "There was an error processing your request. Please try again later.",
        ephemeral: true,
      });
    }
  },
};