const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");

/*
This script should be run every time commands are added, removed,
or otherwise updated. This script deploys the commands in the commands
folder to the REST endpoint for them to appear as slash commands in
Discord clients.
*/

const globalCommands = [];
const guildCommands = [];

// Get list of all command files from commands directory
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load all commands into either global or guild specific commands array, depending on global flag
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.global) {
    globalCommands.push(command.data.toJSON());
  } else {
    if (command.roleIds) {
      guildCommands.push(command.data.setDefaultPermission(false).toJSON());
    } else {
      guildCommands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "9" }).setToken(token);

// Deploy all global commands to REST endpoint
rest
  .put(Routes.applicationCommands(clientId), { body: globalCommands })
  .then(() =>
    console.log("Successfully registered global application commands.")
  )
  .catch(console.error);

// Deploy all guild commands to REST endpoint
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), {
    body: guildCommands,
  })
  .then(() =>
    console.log("Successfully registered guild specific application commands.")
  )
  .catch(console.error);
