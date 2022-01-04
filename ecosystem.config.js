// Config options used by Process Manager 2 to manage the bot process
// Only used by PM2 if it is installed

module.exports = {
  apps: [
    {
      name: "becky-bot",
      script: "index.js",
      // Restart on file change
      watch: true,
      // Specify delay between watch interval
      watch_delay: 1000,
      // Specify which files/folders to ignore
      ignore_watch: ["database.sqlite", "node_modules"],
    },
    {
      name: "deploy-commands",
      script: "deploy-commands.js",
      // Restart on file change
      watch: true,
      // Specify delay between watch interval
      watch_delay: 1000,
      // Specify which files/folders to ignore
      ignore_watch: ["database.sqlite", "node_modules"],
      // Don't autorestart when process ends
      autorestart: false,
    },
  ],
};
