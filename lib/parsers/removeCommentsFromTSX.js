const babel = require("@babel/core");
const pluginSyntaxJsx = require("./pluginSyntaxJsx");
const presetTypescriptPath = require("./presetTypescriptPath");
const traverse = require("@babel/traverse").default;

function removeCommentsFromTSX(code, filePath) {
  // Adicionando um nome de arquivo fictício para o contexto da transformação
  const filename = filePath.replace(".js", ".tsx").replace(".jsx", ".tsx");
  let error = null;

  try {
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

    return { code: output.code, error };
  } catch (syntaxError) {
    error = syntaxError.message;

    return { code, error };
  }
}

module.exports = removeCommentsFromTSX;
