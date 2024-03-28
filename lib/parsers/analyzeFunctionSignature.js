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
  // Analisa o código para gerar a AST
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: [
      // Lista de plugins que você pode precisar para sintaxes específicas
      "jsx",
    ],
  });

  // Função para verificar se o parâmetro é um destructuring
  const isParameterDestructuring = (param) => param.type === "ObjectPattern";

  // Inicializa a flag e os parâmetros capturados
  let capturedParams = null;
  let isDestructuring = false;

  // Navega pela AST
  traverse(ast, {
    // Captura todas as Funções Arrow
    ArrowFunctionExpression(path) {
      // Verifica se é a primeira função capturada
      if (!capturedParams) {
        const params = path.node.params;
        if (params.length > 0) {
          // Verifica se o primeiro parâmetro é um destructuring
          isDestructuring = isParameterDestructuring(params[0]);
          // Extrai os parâmetros
          capturedParams = params
            .map((param) => {
              if (isDestructuring) {
                return `{${param.properties
                  .map((prop) => prop.key.name)
                  .join(", ")}}`;
              }
              return param.name;
            })
            .join(", ");
        }
      }
    },
  });

  return { capturedParams, isDestructuring };
};

module.exports = analyzeFunctionSignature;
