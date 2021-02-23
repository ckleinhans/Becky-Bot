module.exports = {
    name: 'flip',
    description: 'Flips a coin. Will it be heads or tails?',
    usage: '',
    cooldown: 5,
    args: false,
    serverOnly: false,
    adminOnly: false,
    aliases: ['coinflip'],
    
    execute(message, args) {
        const paths = ['./resources/tails.png', './resources/heads.png'];
        const filePath = paths[Math.floor(Math.random() * paths.length)];
        
        message.channel.send('And the result is...', { files: [filePath] });
    },
};