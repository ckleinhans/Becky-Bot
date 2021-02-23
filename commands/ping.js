module.exports = {
  name: "ping",
  description: "Pong!",
  usage: "",
  cooldown: 5,
  args: false,
  serverOnly: false,
  adminOnly: false,
  aliases: [],

  execute(message, args) {
    message.channel.send("Pong!");
  },
};
