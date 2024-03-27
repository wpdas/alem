const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extracts the JSX contents only from file
 *
 * Isso retorna uma lista dos prinpais elementos JSX pais.
 *
 * @param {string} code
 * @returns
 */
function extractJSX(code) {
  // V2 = Retorna uma lista de elementos JSX. Entao se caso dentro da funçao for
  // encontrado mais de uma ocorrencia, retorna ambos.
  // Isso acontece em casos como do arquivo RouteLink que dependendo de uma comparação
  // retorna um grupo de jsx ou outro grupo de jsx
  let jsxList = [];

  // Analisa o código para AST
  const ast = babel.parse(code, {
    presets: [presetReactPath],
  });

  // Percorre a AST para encontrar o JSX retornado pela função do componente
  traverse(ast, {
    ReturnStatement(path) {
      // Verifica se o retorno está dentro de uma função relevante (ArrowFunctionExpression ou outras)
      if (
        path.getFunctionParent().isArrowFunctionExpression() ||
        path.getFunctionParent().isFunctionExpression() ||
        path.getFunctionParent().isFunctionDeclaration()
      ) {
        const jsxAST = path.node.argument;

        // Gera código JSX a partir da subárvore AST e adiciona à lista
        const jsxCode = generate(jsxAST, { concise: true }).code;
        jsxList.push(jsxCode);
        // Não chama path.stop() para continuar a travessia e encontrar outros JSX
      }
    },
  });

  // return jsx;
  return jsxList;
}
// function extractJSX(code) {
//   let jsx = null;

//   // Analisa o código para AST
//   const ast = babel.parse(code, {
//     presets: [presetReactPath],
//   });

//   // Percorre a AST para encontrar o JSX retornado pela função do componente
//   traverse(ast, {
//     ReturnStatement(path) {
//       // Verifica se o retorno está dentro de uma ArrowFunctionExpression
//       if (path.getFunctionParent().isArrowFunctionExpression()) {
//         const jsxAST = path.node.argument;

//         // Gera código JSX a partir da subárvore AST
//         jsx = generate(jsxAST).code;
//         path.stop(); // Interrompe a travessia após encontrar o primeiro JSX
//       }
//     },
//   });

//   return jsx;
// }

module.exports = extractJSX;
