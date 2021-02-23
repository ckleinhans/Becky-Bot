module.exports = {
    name: 'sendmessage',
    description: 'Debug command to send class messages to the class channel.',
    usage: '<channel ID> <message>',
    cooldown: 5,
    args: true,
    serverOnly: true,
    adminOnly: true,
    aliases: ['sm'],
    
    execute(message, args) {
        message.guild.channels.cache.get(args[0]).send(args.join(' ').substring(args[0].length + 1));
    },
};