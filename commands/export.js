const db = require("quick.db");
const fs = require("fs");

module.exports = {
  name: "export",
  description: "Exports the database contents to export.json",
  usage: "",
  cooldown: 5,
  args: false,
  serverOnly: true,
  adminOnly: true,
  aliases: [],

  execute(message, args) {
    const data = db.all();
    const output = JSON.stringify(data);
    fs.writeFile("./export.json", output, (error) => {
      if (error) {
        this.handleError(error);
      } else {
        message.channel.send("export.json file written");
      }
    });
  },
};
