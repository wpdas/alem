const path = require("path");

// Ajuste para usar o caminho absoluto do preset-react
const pluginSyntaxJsx = path.join(
  __dirname,
  "../../",
  "node_modules",
  "@babel/plugin-syntax-jsx",
);

module.exports = pluginSyntaxJsx;
