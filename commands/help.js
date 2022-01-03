const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

/*
Help command that lists all commands and descriptions to the user.
*/

module.exports = {
  global: true,
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Displays a list of all available commands and their descriptions."
    ),
  async execute(interaction) {
    const commands = interaction.client.commands.filter(
      (cmd) =>
        !cmd.roleIds ||
        (interaction.member &&
          cmd.roleIds.find((role) => interaction.member.roles.cache.has(role)))
    );

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle("Command List")
      .setDescription(
        commands
          .map(
            (cmd) =>
              `**${cmd.data.name}** ${cmd.global ? "" : "*(Server only)*"}\n${
                cmd.data.description
              }\n`
          )
          .join("\n")
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
