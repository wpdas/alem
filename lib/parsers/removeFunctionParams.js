const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;

/**
 * Usa o Babel para remover qualquer parametro da função que constroi o componente stateful.
 * @param {string} code
 * @returns
 */
const removeFunctionParams = (code) => {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"], // Adicione 'typescript' aqui se estiver lidando com TypeScript
  });

  let foundTopLevelFunction = false;

  traverse(ast, {
    ArrowFunctionExpression(path) {
      // Checa se a função é de nível superior verificando se o pai é um VariableDeclarator
      if (
        !foundTopLevelFunction &&
        path.parentPath.node.type === "VariableDeclarator"
      ) {
        foundTopLevelFunction = true;
        path.node.params = []; // Remove todos os parâmetros
      }
    },
    FunctionDeclaration(path) {
      // Checa se a função é de nível superior verificando se o pai é o Program
      if (!foundTopLevelFunction && path.parentPath.node.type === "Program") {
        foundTopLevelFunction = true;
        path.node.params = []; // Remove todos os parâmetros
      }
    },
    // Adicione mais visitantes conforme necessário
  });

  // Gerando o código modificado a partir da AST
  const output = generator(ast, {}, code);

  return output.code; // Retorna o código modificado
};

module.exports = removeFunctionParams;
