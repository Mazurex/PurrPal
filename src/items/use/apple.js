module.exports.use = async (interaction) => {
  await interaction.reply({
    content: "You used an apple!",
  });
};
