/**
 * Handle alem.config.json under apps folder
 * */
const fs = require("fs");
const path = require("path");

function read_alem_config() {
  const configPath = path.join(".", "alem.config.json");
  if (!fs.existsSync(configPath)) {
    console.warn(`INFO: File 'alem.config.json' not found! If you're using the CLI within a project, you must create this file to setup your project. Take a look at the Além docs: https://alem.dev/?path=config-file.`);
    console.log("\n")
    return {};
  }
  const configRaw = fs.readFileSync(configPath);
  try {
    JSON.parse(configRaw);
  } catch (e) {
    throw new Error(`./alem.config.json is not a valid json file`);
  }
  const config = JSON.parse(configRaw);
  if (!config.mainnetAccount && !config.mainnetAccount) {
    console.warn(
      `WARNING: "mainnetAccount" | "testnetAccount" not found in ./alem.config.json, build script may work but dev requires it`,
    );
  }
  return config;
}

module.exports = {
  read_alem_config,
};
