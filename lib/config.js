/**
 * Handle alem.config.json under apps folder
 * */
const fs = require("fs");
const path = require("path");

function read_alem_config() {
  const configPath = path.join(".", "alem.config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`alem.config.json not found`);
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
