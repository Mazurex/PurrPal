const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const moneys = require("../../models/moneys");

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Change the game experience to what you want!"),
  async execute(interaction) {
    try {
      const profile = await moneys.findOne({ userId: interaction.user.id });

      // Function to generate the main settings embed
      const generateMainEmbed = () => {
        return new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${interaction.user.username}'s settings`)
          .setDescription(
            "These are your settings, use the drop down menu below to change these"
          )
          .addFields(
            {
              name: "Robbing",
              value: profile.settings.robbing ? "Enabled" : "Disabled",
              inline: true,
            },
            {
              name: "Gifting",
              value: profile.settings.gifting ? "Enabled" : "Disabled",
              inline: true,
            }
          );
      };

      // Function to generate the dropdown menu
      const generateMenu = () => {
        return new StringSelectMenuBuilder()
          .setCustomId("settings_menu")
          .setPlaceholder("Choose a setting to customize")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Robbing")
              .setDescription("Disable/Enable robbing for you")
              .setValue("robbing"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Gifting")
              .setDescription("Disable/Enable gifting for you")
              .setValue("gifting")
          );
      };

      // Function to generate buttons
      const generateButtons = () => {
        const trueButton = new ButtonBuilder()
          .setCustomId("true")
          .setLabel("Enable")
          .setStyle(ButtonStyle.Success);
        const falseButton = new ButtonBuilder()
          .setCustomId("false")
          .setLabel("Disable")
          .setStyle(ButtonStyle.Danger);
        const cancelButton = new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary);

        return new ActionRowBuilder().addComponents(
          trueButton,
          falseButton,
          cancelButton
        );
      };

      // Function to handle the main menu
      const showMainMenu = async () => {
        const menuRow = new ActionRowBuilder().addComponents(generateMenu());

        await interaction.editReply({
          embeds: [generateMainEmbed()],
          components: [menuRow],
          ephemeral: true,
        });
      };

      // Initial interaction response
      await interaction.reply({
        embeds: [generateMainEmbed()],
        components: [new ActionRowBuilder().addComponents(generateMenu())],
        ephemeral: true,
      });

      const menuFilter = (i) =>
        i.user.id === interaction.user.id && i.customId === "settings_menu";

      const menuCollector = interaction.channel.createMessageComponentCollector(
        {
          filter: menuFilter,
          componentType: ComponentType.StringSelect,
          time: 60_000,
        }
      );

      menuCollector.on("collect", async (menuSelection) => {
        const selectedValue = menuSelection.values[0];

        const settingEmbed = new EmbedBuilder()
          .setColor("Aqua")
          .setTitle(
            selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)
          )
          .setDescription(
            `Choose an option below.\nTrue enables ${selectedValue}, False disables ${selectedValue}`
          );

        await menuSelection.update({
          embeds: [settingEmbed],
          components: [generateButtons()],
        });

        const buttonFilter = (i) =>
          i.user.id === interaction.user.id &&
          ["true", "false", "cancel"].includes(i.customId);

        const buttonCollector =
          menuSelection.channel.createMessageComponentCollector({
            filter: buttonFilter,
            componentType: ComponentType.Button,
            time: 60_000,
          });

        buttonCollector.on("collect", async (buttonSelection) => {
          if (buttonSelection.customId === "cancel") {
            await showMainMenu();
          } else {
            const settingStatus =
              buttonSelection.customId === "true" ? true : false;

            // Update the profile in the database
            if (selectedValue === "robbing") {
              profile.settings.robbing = settingStatus;
            } else if (selectedValue === "gifting") {
              profile.settings.gifting = settingStatus;
            }
            await profile.save();

            await buttonSelection.update({
              embeds: [generateMainEmbed()],
              components: [
                new ActionRowBuilder().addComponents(generateMenu()),
              ],
            });
          }
        });

        buttonCollector.on("end", async (collected, reason) => {
          if (reason === "time") {
            await interaction.editReply({
              content: "Confirmation not received within 1 minute, cancelling",
              components: [],
              ephemeral: true,
            });
          }
        });
      });

      menuCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
          await interaction.editReply({
            content: "Confirmation not received within 1 minute, cancelling",
            components: [],
            ephemeral: true,
          });
        }
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error with the settings command!",
        ephemeral: true,
      });
    }
  },
};
