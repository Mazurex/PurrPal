const { EmbedBuilder, Events } = require("discord.js");
const { main_guild } = require("../settings.json");

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    if (!member.guild.id === main_guild) return;

    try {
      member.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Aqua")
            .setTitle(`Welcome to ${member.guild}!`)
            .setDescription(
              `Welcome to the PurrPal support server! Here you can ask for help, meet other PurrPal lovers, or hang out with the community, here we offer: patch notes, warnings for downtime, and much more!`
            )
            .setTimestamp(),
        ],
      });
    } catch (error) {}
  },
};
