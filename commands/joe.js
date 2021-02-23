module.exports = {
  name: 'joe',
  description: 'Thanks Joe.',
  usage: '',
  cooldown: 5,
  args: false,
  serverOnly: false,
  adminOnly: false,
  aliases: ['thanksjoe', 'beok', 'gonnabeok'],
  
  execute(message, args) {
    message.channel.send({ files: ['./resources/thanksjoe.mp4'] });
  },
};