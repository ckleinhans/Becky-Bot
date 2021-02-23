const { prefix, adminRoleId } = require('../config.json');

module.exports = {
    name: 'help',
    description: 'Lists all possible commands or information on a specific command.',
    usage: '[command name]',
    cooldown: 3,
    args: false,
    serverOnly: false,
    adminOnly: false,
    aliases: ['commands'],
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        // If no arguments, send list of all commands via dm (only sends admin commands if called from server and caller is admin)
        if (!args.length) {
            data.push('Hey Badger! Here\'s all the stuff I can do:');
            commands.map(command => {
                if (message.channel.type === 'dm') {
                    if (!command.adminOnly) {
                        data.push(`${command.name} -> ${command.description}`);
                    }
                } else if (!command.adminOnly || message.member.roles.cache.has(adminRoleId)) {
                    data.push(`${command.name} -> ${command.description}`);
                }
            });

            data.push(`\nYou can say \`${prefix}help [command name]\` to get info on a specific command.`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands. On Wisconsin!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        // If arguments, find help on specfic command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send('Uh oh, that doesn\'t appear to be a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    },
};