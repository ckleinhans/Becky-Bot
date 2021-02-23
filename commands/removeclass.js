const { classRegisterChannelId } = require("../config.json");
const fs = require("fs");
const {
  getClassData,
  setClassData,
  findClass,
  handleError,
} = require("../index.js");

module.exports = {
  name: "removeclass",
  description:
    "Removes a class from the class list and puts it channel into the class archive.",
  usage: "<class name> <archive category id>",
  cooldown: 5,
  args: true,
  serverOnly: true,
  adminOnly: true,
  aliases: ["deleteclass", "rc"],


  // TODO entire revamp of command to handle new archive process
  execute(message, args) {
    if (args.length < 2) {
      return message.channel.send(
        `Improper usage of ${this.name}. Usage: ${prefix}${this.name} ${this.usage}`
      );
    }

    let classCategories = getClassData();

    const classInfo = findClass(args[0], "className");
    const className = classInfo.className;

    // Move channel to archive and update permissions
    const classChannel = message.guild.channels.resolve(classInfo.channelId);
    classChannel.setParent(args[1]);
    // TODO check if permissions auto updated
    // classChannel.overwritePermissions(
    //   [
    //     {
    //       id: message.guild.id,
    //       allow: ["VIEW_CHANNEL"],
    //       deny: ["SEND_MESSAGES"],
    //     },
    //   ],
    //   "Class deleted"
    // );
    console.log(`Archived channel ${className}`);

    // Delete message in class registration channel
    message.guild.channels
      .resolve(classRegisterChannelId)
      .messages.fetch(classInfo.messageId)
      .then((messageObj) => messageObj.delete())
      .catch((error) => handleError(error));

    // Delete class role
    message.guild.roles.cache.get(classInfo.roleId).delete("Class deleted");
    console.log(`Deleted role ${className}`);

    // Remove class from classData
    for (let i = 0; i < classCategories.length; i++) {
      for (let j = 0; j < classCategories[i].classes.length; j++) {
        if (classCategories[i].classes[j].className == className) {
          classCategories[i].classes.splice(j, 1);
        }
      }
    }

    // Update classes list
    setClassData(classCategories);
    message.channel.send(`Class ${className} has been archived.`);
    return;
  },
};
