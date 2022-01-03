/*
Handles the interactionCreate event, emitted when a user initiates an interaction.
*/

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    // If interaction isnt a command, return
    if (!interaction.isCommand()) return;

    // Log interaction command message to console
    console.log(
      `${interaction.user.tag} used the command ${interaction.commandName}`
    );

    // Get command from collection; if non-existant, return
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // Execute the command
    try {
      await command.execute(interaction);
    } catch (error) {
      await interaction.client.handleError(
        `Error for ${interaction.user.tag} executing command ${interaction.commandName}`,
        error,
        interaction
      );
    }
  },
};
