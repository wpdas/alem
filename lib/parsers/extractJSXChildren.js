const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extrai o conteúdo children de um elemento JSX como uma única string.
 * @param {string} code O código JSX.
 * @returns {string} Uma string contendo todos os children concatenados.
 */
function extractJSXChildren(code) {
  let childrenAsString = "";

  // Analisa o código para gerar a AST
  const ast = babel.parse(code, {
    presets: [presetReactPath],
    sourceType: "module",
  });

  // Percorre a AST
  traverse(ast, {
    JSXElement(path) {
      // Verifica se é o elemento JSX desejado
      // Pode ser necessário ajustar esta parte para especificar qual elemento JSX tratar
      path.node.children.forEach((child) => {
        // Gera o código para cada child, independentemente do seu tipo
        const childCode = generate(child, { concise: true }).code;
        // Remove possíveis ponto e vírgula (;) no final do código gerado para expressões
        const cleanChildCode = childCode.replace(/;$/, "");
        // Concatena o código do child na string de children
        childrenAsString += cleanChildCode;
      });

      // Para extrair apenas o primeiro nível de children do primeiro JSXElement encontrado
      path.stop();
    },
  });

  if (childrenAsString) {
    if (childrenAsString.startsWith("<>")) {
      return childrenAsString;
    }

    return `<>${childrenAsString}</>`;
  }

  return childrenAsString;
}

module.exports = extractJSXChildren;
