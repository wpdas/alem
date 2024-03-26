const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extracts the JSX content only from file
 * @param {string} code
 * @returns
 */
function extractJSX(code) {
  let jsx = null;

  // Analisa o código para AST
  const ast = babel.parse(code, {
    presets: [presetReactPath],
  });

  // Percorre a AST para encontrar o JSX retornado pela função do componente
  traverse(ast, {
    ReturnStatement(path) {
      // Verifica se o retorno está dentro de uma ArrowFunctionExpression
      if (path.getFunctionParent().isArrowFunctionExpression()) {
        const jsxAST = path.node.argument;

        // Gera código JSX a partir da subárvore AST
        jsx = generate(jsxAST).code;
        path.stop(); // Interrompe a travessia após encontrar o primeiro JSX
      }
    },
  });

  return jsx;
}

module.exports = extractJSX;
