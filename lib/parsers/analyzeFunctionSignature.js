// Importa as dependências do Babel
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Analisa o código e pega o parametro inteiro na assinatura da função.
 * Basicamente retorna os parametros da função do componente.
 * @param {string} signature Conteúdo do componente stateful
 * @returns {{capturedParams: string | null; isDestructuring: boolean;}}
 */
const analyzeFunctionSignature = (code) => {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const isParameterDestructuring = (param) => param.type === "ObjectPattern";

  let capturedParams = null;
  let isDestructuring = false;
  let foundTopLevelFunction = false;

  traverse(ast, {
    ArrowFunctionExpression(path) {
      // Checa se já encontrou uma função de nível superior e ignora funções aninhadas
      if (
        !foundTopLevelFunction &&
        path.parentPath.node.type === "VariableDeclarator"
      ) {
        foundTopLevelFunction = true;
        const params = path.node.params;
        if (params.length > 0) {
          isDestructuring = isParameterDestructuring(params[0]);
          capturedParams = params
            .map((param) => {
              if (isDestructuring) {
                // return `{${param.properties.map((prop) => prop.key.name).join(", ")}}`;
                // Add support to rename prop
                return `{${param.properties.map((prop) => (prop.value.name ? `${prop.key.name}: ${prop.value.name}` : prop.key.name)).join(", ")}}`;
              }
              return param.name;
            })
            .join(", ");
        }
      }
    },
    FunctionDeclaration(path) {
      if (!foundTopLevelFunction && path.parentPath.node.type === "Program") {
        foundTopLevelFunction = true;
        const params = path.node.params;
        if (params.length > 0) {
          isDestructuring = isParameterDestructuring(params[0]);
          capturedParams = params
            .map((param) => {
              if (isDestructuring) {
                // return `{${param.properties.map((prop) => prop.key.name).join(", ")}}`;
                // Add support to rename prop
                return `{${param.properties.map((prop) => (prop.value.name ? `${prop.key.name}: ${prop.value.name}` : prop.key.name)).join(", ")}}`;
              }
              return param.name;
            })
            .join(", ");
        }
      }
    },
    // Você pode adicionar mais tipos de funções aqui se necessário
  });

  return { capturedParams, isDestructuring };
};

module.exports = analyzeFunctionSignature;
