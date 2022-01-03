const { guildId } = require("../config.json");
const { Users, Classes, Categories } = require("../dbObjects");

/*
Handles the ready event, emitted when the client successfully starts and connects.
*/

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set command permissions for all commands
    console.log("Setting command permissions...");
    // Fetch guild specified in config & guild specific commands
    const guild = await client.guilds.fetch(guildId);
    const commands = await guild.commands.fetch();

    // For each guild command, if roleIds is defined, set permission to true for all roleIds
    commands.forEach((command) => {
      const roleIds = client.commands.get(command.name).roleIds;
      if (roleIds) {
        guild.commands.permissions
          .set({
            command: command.id,
            permissions: roleIds.map((roleId) => {
              return { id: roleId, type: "ROLE", permission: true };
            }),
          })
          .then(console.log(`Set permissions for ${command.name}`))
          .catch(console.error);
      }
    });

    // Fetch and load all data into Collections
    Users.findAll()
      .then((userData) => {
        userData.forEach((data) => client.userData.set(data.user_id, data));
        console.log("User data loaded.");
      })
      .catch(console.error);
    Classes.findAll()
      .then((classData) => {
        classData.forEach((data) => client.classData.set(data.name, data));
        console.log("Class data loaded.");
      })
      .catch(console.error);
    Categories.findAll()
      .then((categoryData) => {
        categoryData.forEach((data) => client.categoryData.set(data.id, data));
        console.log("Category data loaded.");
      })
      .catch(console.error);
  },
};
