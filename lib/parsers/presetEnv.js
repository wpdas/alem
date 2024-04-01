const path = require("path");

// Ajuste para usar o caminho absoluto do preset-react
const presetEnvPath = path.join(
  __dirname,
  "../../",
  "node_modules",
  "@babel/preset-env",
);

module.exports = presetEnvPath;
