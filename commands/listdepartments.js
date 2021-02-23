const { departments } = require('../departments.json');

module.exports = {
    name: 'listdepartments',
    description: 'Sends you a list of all valid academic department codes for classes.',
    usage: '',
    cooldown: 5,
    args: false,
    serverOnly: false,
    adminOnly: false,
    aliases: ['departments'],
    
    execute(message, args) {
        return message.author.send(departments.join(', '))
            .then(() => {
                if (message.channel.type === 'dm') return;
                message.reply('I\'ve sent you a DM with the list of department codes. On Wisconsin!');
            })
            .catch(error => {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
            });
    },
};