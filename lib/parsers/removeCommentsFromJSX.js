const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const presetEnvPath = require("./presetEnv");
const generate = require("@babel/generator").default;

/**
 * Remove comentários do código JSX. Por causa do Babel, os parenteses de um Arrow Function
 * são removidos e não existe uma propriedade para desabilitar isso.
 * @param {string} code
 * @returns
 */
function removeCommentsFromJSX(code) {
  const ast = babel.parse(code, {
    // Parse o código como JSX e ESNext (para recursos modernos do JavaScript)
    presets: [presetReactPath, presetEnvPath],
    plugins: [
      // Utiliza o plugin para remover comentários diretamente durante a análise do código
      function myCustomPlugin() {
        return {
          visitor: {
            Program(path) {
              path.traverse({
                enter(path) {
                  // Limpa todos os tipos de comentários
                  path.node.leadingComments =
                    path.node.trailingComments =
                    path.node.innerComments =
                      null;
                },
              });
            },
          },
        };
      },
    ],
  });

  // Re-gera o código a partir da AST modificada, preservando a sintaxe JSX
  const output = generate(ast, {
    retainLines: true, // Tenta manter a mesma estrutura de linhas
    compact: false, // Não compacta o código de saída
    concise: false, // Mantém a formatação mais próxima do original possível
    comments: false, // Remove os comentários
  });

  return output.code;
}

module.exports = removeCommentsFromJSX;
