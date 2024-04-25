const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Transforma qualquer variável em outro valor "replacement"
 * Exemplo:
 *
 * entrada: "const Bar = () => { console.log('oi', age); }"
 * saída: const Bar = () => { console.log('oi', :::PROP_HERE:::); };
 *
 * onde o :::PROP_HERE::: é o "replacement"
 *
 * @param {*} code
 * @param {*} variableName
 * @param {*} replacement
 * @returns
 */
function transformVariableInCode(code, variableName, replacement) {
  const ast = parser.parse(`const tempDecl = ${code}`, {
    sourceType: "module",
    plugins: ["jsx", "typescript"], // Suporte para TypeScript e JSX se necessário
  });

  traverse(ast, {
    Identifier(path) {
      if (path.node.name === variableName) {
        path.node.name = replacement;
      }
    },
  });

  const output = generate(ast, { concise: true, semi: false });
  // Regex para remover o último ponto e vírgula antes do fim da string ou de um fechamento de bloco
  const finalOutput = output.code
    .replace(/;(?=[^;]*$)/, "")
    .replace("const tempDecl = ", "");
  return finalOutput;
}

module.exports = transformVariableInCode;
