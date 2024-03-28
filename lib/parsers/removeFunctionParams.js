const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;

/**
 * Usa o Babel para remover qualquer parametro da função que constroi o componente stateful.
 * @param {string} code
 * @returns
 */
const removeFunctionParams = (code) => {
  // Analisando o código para obter a AST
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"], // Adicione 'typescript' aqui se estiver lidando com TypeScript
  });

  // Modificando a AST: removendo parâmetros de funções
  traverse(ast, {
    ArrowFunctionExpression(path) {
      path.node.params = []; // Remove todos os parâmetros
    },
    FunctionDeclaration(path) {
      path.node.params = []; // Remove todos os parâmetros
    },
    // Você pode adicionar mais visitantes aqui para outros tipos de funções
  });

  // Gerando o código modificado a partir da AST
  const output = generator(ast, {}, code);

  return output.code;
};

module.exports = removeFunctionParams;
