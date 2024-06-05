const { EmbedBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.mentions.has(message.client.user) && !message.author.bot) {
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Blue")
            .setTitle("PurrPal")
            .setDescription(
              "Hello! If you wish to use PurrPal, adopt a cat with `/adopt` or view the guide at `/guide`"
            ),
        ],
      });
    }
  },
};
