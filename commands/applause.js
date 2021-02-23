module.exports = {
  name: "applause",
  description: "Bravo bravo!!",
  usage: "",
  cooldown: 15,
  args: false,
  serverOnly: true,
  adminOnly: false,
  aliases: ["clap"],

  execute(message, args) {
    if (message.member.voice.channel) {
      message.member.voice.channel
        .join()
        .then((connection) => {
          console.log(
            `Connected to ${connection.channel.name} and playing applause`
          );
          connection.play("./resources/clap.m4a", { volume: 0.5 });
          // TODO disconnect
        })
        .catch(console.error);
    } else {
      message.reply("you must join a voice channel to use that command!");
    }
    return;
  },
};
