const path = require("path");

// Ajuste para usar o caminho absoluto do preset-react
const presetTypescriptPath = path.join(
  __dirname,
  "../../",
  "node_modules",
  "@babel/preset-typescript",
);

module.exports = presetTypescriptPath;
