module.exports = {
  name: 'reload',
  description: 'Reloads all commands or a specific command.',
  usage: '[command name]',
  cooldown: 10,
  args: false,
  serverOnly: true,
  adminOnly: true,
  aliases: [],
  execute(message, args) {
    // If no arguments, reload all commands
    if (!args.length) {
      for (const command in message.client.commands) {
        // If command is reload, skip it
        if (command.name === 'reload') continue;

        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
          const newCommand = require(`./${command.name}.js`);
          message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
          console.error(error);
          message.channel.send(`There was an error while reloading the command \`${command.name}\`:\n\`${error.message}\``);
        }
      }
      return message.channel.send('All commands reloaded!');
    }

    // If there is an argument, check for that command and reload it
    const commandName = args[0].toLowerCase();
    const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.channel.send(`I don't know a command called \`${commandName}\`.`);

    delete require.cache[require.resolve(`./${command.name}.js`)];
    try {
      const newCommand = require(`./${command.name}.js`);
      message.client.commands.set(newCommand.name, newCommand);
      message.channel.send(`Command \`${command.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      message.channel.send(`There was an error while reloading the command \`${command.name}\`:\n\`${error.message}\``);
    }
  },
};