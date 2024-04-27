const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const babel = require("@babel/core");
const typescriptPreset = require("@babel/preset-typescript");
const convertFunctionsToArrow = require("./convertFunctionsToArrow");
const removeGetNameAndLastComma = require("./removeGetNameAndLastComma");
const removeImportsAndExports = require("./removeImportsAndExports");

/**
 * Esta função vai cobrir o arquivo/code com uma função Get e todas as declarações sendo exportadas
 * serão retornadas dentro dela.
 *
 * Exemplo, dado de entrada:
 *
 * const code = `
 * const abrolhos = "oi";
 * export const num = 42;
 * export function compute() { return num * 2; }
 * export default compute;
 * `;
 *
 * Saída:
 *
 * function Get() {
 * const abrolhos = "oi";
 * const num = 42;
 * function compute() {
 *   return num * 2;
 * }
 * const default = compute;
 * return {
 *   num: 42,
 *   default: compute
 * };
 * }
 *
 * @param {*} code
 * @returns
 */
function wrapCodeInGetFunction(code, filePath) {
  // Remover importações e exports
  // code = code.replace(/import.*;|export\s+default|export\s+/g, "");
  code = removeImportsAndExports(code);

  // Parsear o código para AST removendo TypeScript
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const identifiers = new Set();

  // Capturar identificadores de todas as declarações top-level
  traverse(ast, {
    VariableDeclaration(path) {
      if (path.parent.type === "Program") {
        path.node.declarations.forEach((decl) => {
          if (decl.id.name) {
            identifiers.add(decl.id.name);
          }
        });
      }
    },
    FunctionDeclaration(path) {
      if (path.parent.type === "Program" && path.node.id) {
        identifiers.add(path.node.id.name);
      }
    },
    ClassDeclaration(path) {
      if (path.parent.type === "Program" && path.node.id) {
        identifiers.add(path.node.id.name);
      }
    },
  });

  // Criar a função Get que encapsula o código e retorna um objeto com todas as declarações
  const returnObject = t.objectExpression(
    Array.from(identifiers).map((id) =>
      t.objectProperty(t.identifier(id), t.identifier(id)),
    ),
  );

  const getFunction = t.arrowFunctionExpression(
    [],
    t.blockStatement([...ast.program.body, t.returnStatement(returnObject)]),
  );

  const newAst = t.program([
    t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier("Get"), getFunction),
    ]),
  ]);

  // Transformar o novo AST em JavaScript puro, removendo TypeScript
  const { code: transformedCode } = babel.transformFromAstSync(newAst, null, {
    presets: [
      // INFO: Isso estava gerando os helpers no topo do arquivo
      // babelPreset,
      // INFO: Esse preset estava transformando os arquivos
      // reactPreset,
      typescriptPreset,
    ],
    code: true,
    configFile: false, // Ignora qualquer configuração do Babel externa
    filename: filePath,
  });

  // Troca o "const Get = " por "", isso porque o módulo é a função diretamente
  // e remove o último ";" encontrado porque a função vai ser colocar em uma lista de objetos, ou seja,
  // vai ter um "," separando cada objeto.
  return removeGetNameAndLastComma(convertFunctionsToArrow(transformedCode));
  // .replace("const Get = ", "")
  // .replace(/;(?=[^;]*$)/, "");
}

module.exports = wrapCodeInGetFunction;
