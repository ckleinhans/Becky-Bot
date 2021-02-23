module.exports = {
  name: 'random',
  description: 'Generates a random number from 1 to a given value. Optionally include a minimum value.',
  usage: '<maximum> [minimum]',
  cooldown: 2,
  args: true,
  serverOnly: false,
  adminOnly: false,
  aliases: ['roll'],
  
  execute(message, args) {
    if (args.length > 1) {
      if (parseInt(args[0]) < parseInt(args[1])) {
        return message.channel.send(`I don't think ${args[0]} is greater than ${args[1]}...`);
      }
      const difference = parseInt(args[0]) - parseInt(args[1]) + 1;
      return message.channel.send(`Bucky's lucky number is...\n**${Math.ceil(Math.random() * difference) + parseInt(args[1]) - 1}**`);
    }
    message.channel.send(`Bucky's lucky number is...\n**${Math.ceil(Math.random() * args[0])}**`);
  },
};