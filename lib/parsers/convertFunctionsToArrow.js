const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;

/**
 * Converte todas as "function" em arrow functions
 * @param {*} code
 * @returns
 */
function convertFunctionsToArrow(code) {
  // Parsear o código para criar a AST
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"], // Adiciona suporte para JSX e TypeScript, se necessário
  });

  // Transformar todas as funções declaradas e funções anônimas em expressões de arrow
  traverse(ast, {
    FunctionDeclaration(path) {
      const { id, params, body, async } = path.node;
      const arrowFunction = t.arrowFunctionExpression(params, body, async);
      arrowFunction.returnType = path.node.returnType; // Preserva o tipo de retorno, se for TypeScript
      path.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(id, arrowFunction),
        ]),
      );
    },
    FunctionExpression(path) {
      const { params, body, async } = path.node;
      const arrowFunction = t.arrowFunctionExpression(params, body, async);
      path.replaceWith(arrowFunction);
    },
  });

  // Gerar o código JavaScript modificado a partir da AST atualizada
  return generate(ast, {
    /* Opções aqui, se necessário */
  }).code;
}

module.exports = convertFunctionsToArrow;
