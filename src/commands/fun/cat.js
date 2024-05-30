const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("cat")
    .setDescription("View a gif of a cat"),
  async execute(interaction) {
    try {
      const response = await axios.get(
        "https://api.thecatapi.com/v1/images/search?mime_types=gif",
        {
          params: {
            limit: 1,
          },
        }
      );

      const catGifUrl = response.data[0].url;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Aqua")
            .setTitle("Random Cat GIF!")
            .setImage(catGifUrl),
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "Sorry, I couldn't fetch a cat gif!",
        ephemeral: true,
      });
    }
  },
};
