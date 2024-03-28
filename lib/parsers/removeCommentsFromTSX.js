const babel = require("@babel/core");
const pluginSyntaxJsx = require("./pluginSyntaxJsx");
const presetTypescriptPath = require("./presetTypescriptPath");
const traverse = require("@babel/traverse").default;

function removeCommentsFromTSX(code) {
  // Adicionando um nome de arquivo fictício para o contexto da transformação
  const filename = "file.tsx";

  const ast = babel.parse(code, {
    presets: [presetTypescriptPath],
    plugins: [pluginSyntaxJsx],
    filename, // Incluindo o nome do arquivo nas opções
  });

  traverse(ast, {
    enter(path) {
      path.node.leadingComments =
        path.node.trailingComments =
        path.node.innerComments =
          null;
    },
  });

  // Incluindo o nome do arquivo também aqui
  const output = babel.transformFromAstSync(ast, code, {
    presets: [presetTypescriptPath],
    plugins: [pluginSyntaxJsx],
    filename, // Incluindo o nome do arquivo nas opções
    code: true,
    comments: false,
  });

  return output.code;
}

module.exports = removeCommentsFromTSX;
