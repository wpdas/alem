/**
 * Handle bos.config.json under apps folder
 * */
const fs = require("fs");
const path = require("path");

// NOTE: not used
function read_bos_config() {
  const configPath = path.join(".", "src", "bos.config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`bos.config.json not found`);
  }
  const configRaw = fs.readFileSync(configPath);
  try {
    JSON.parse(configRaw);
  } catch (e) {
    throw new Error(`./bos.config.json is not a valid json file`);
  }
  const config = JSON.parse(configRaw);
  if (!config.appAccount) {
    console.warn(
      `WARNING: appAccount not found in ./bos.config.json, build script may work but dev requires it`,
    );
  }
  return config;
}

module.exports = {
  read_bos_config,
};
