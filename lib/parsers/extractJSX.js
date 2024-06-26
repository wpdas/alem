const babel = require("@babel/core");
const presetReact = require("@babel/preset-react");
const presetTypeScript = require("@babel/preset-typescript");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extracts JSX contents only from file
 *
 * Retorna uma lista dos principais elementos JSX pais.
 *
 * @param {string} code Código fonte de onde extrair JSX
 * @returns {Array} Lista de códigos JSX
 */
function extractJSX(code) {
  let jsxList = [];
  const ast = babel.parse(code, {
    presets: [presetReact, presetTypeScript],
    filename: "input.tsx",
  });

  traverse(ast, {
    JSXElement(path) {
      const jsxCode = generate(path.node, { concise: true }).code;
      jsxList.push(jsxCode);
      path.skip(); // Evita processar subelementos deste JSXElement novamente
    },
    ReturnStatement(path) {
      // Processa apenas o retorno se for uma expressão JSX ou condicional contendo JSX
      if (
        path.node.argument &&
        [
          "JSXElement",
          "JSXFragment",
          "ConditionalExpression",
          "LogicalExpression",
        ].includes(path.node.argument.type)
      ) {
        extractJSXFromNode(path.node.argument, jsxList);
        path.skip(); // Evita reprocessar a expressão interna já manipulada
      }
    },
  });

  return [...new Set(jsxList)]; // Retorna apenas elementos únicos, removendo duplicatas
}

function extractJSXFromNode(node, jsxList) {
  if (!node) return;
  if (node.type === "JSXElement" || node.type === "JSXFragment") {
    const jsxCode = generate(node, { concise: true }).code;
    if (!jsxList.includes(jsxCode)) {
      jsxList.push(jsxCode);
    }
  } else if (
    node.type === "ConditionalExpression" ||
    node.type === "LogicalExpression"
  ) {
    // Recursivamente extrai JSX dos componentes das expressões condicionais e lógicas
    extractJSXFromNode(node.consequent, jsxList);
    extractJSXFromNode(node.alternate, jsxList);
  }
}

module.exports = extractJSX;
