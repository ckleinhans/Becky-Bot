module.exports = {
    name: 'editmessage',
    description: 'Debug command to send class messages to the class channel.',
    usage: '<channel ID> <message ID> <message>',
    cooldown: 5,
    args: true,
    serverOnly: true,
    adminOnly: true,
    aliases: ['em'],
    
    execute(message, args) {
        message.guild.channels.cache.get(args[0]).messages.fetch(args[1])
            .then(messageObj => messageObj.edit(args.join(' ').substring(args[0].length + args[1].length + 2)))
            .catch(console.error);
    },
};