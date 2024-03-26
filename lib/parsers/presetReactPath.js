const path = require("path");

// Ajuste para usar o caminho absoluto do preset-react
const presetReactPath = path.join(
  __dirname,
  "../../",
  "node_modules",
  "@babel/preset-react",
);

module.exports = presetReactPath;
