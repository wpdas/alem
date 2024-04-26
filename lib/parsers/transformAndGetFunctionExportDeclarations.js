const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const convertFunctionsToArrow = require("./convertFunctionsToArrow");
const generate = require("@babel/generator").default;

function convertExportDefault(code) {
  // Regex para capturar `export default` seguido de qualquer palavra (identificador)
  // e não captura casos já com chaves.
  const regex = /export\s+default\s+([a-zA-Z_$][0-9a-zA-Z_$]*)(?!\s*\{)/g;

  // Substituir o código utilizando a regex
  return code.replace(regex, "export { $1 }");
}

/**
 * Usado para extrair as chaves das declaracoes sendo exportadas de dentro de um arquivo
 *
 * Exemplo, dado um arquivo com esse conteúdo:
 *  `
 *  const Foo = () => {console.log('foo');};
 *   function Bar(age) {console.log('bar', age);};
 *   var My = () => {
 *     console.log('ola');
 *   }
 *
 *    export const age = 2;
 *    const contract = "foobar";
 *    export const ba = "boo";
 *   `
 * Tem Esse retorno:
 * [age, ba]
 *
 * @param {*} code
 * @returns
 */
function transformAndGetFunctionExportDeclarations(code, filePath) {
  // Transforma "export default function" para "function"
  code = code.replaceAll(/\bexport default function\b/g, "function");

  // Converte functions para arrow functions
  try {
    code = convertFunctionsToArrow(code);
  } catch (error) {
    console.log(code);
    throw new Error(`File: ${filePath}: ${error}`);
  }

  code = convertExportDefault(code);

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const declarations = {};

    traverse(ast, {
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          // Para declarações diretamente na exportação
          if (path.node.declaration.type === "VariableDeclaration") {
            path.node.declaration.declarations.forEach((decl) => {
              if (decl.id.type === "Identifier") {
                const key = decl.id.name;
                const value = decl.init
                  ? generate(decl.init, { concise: false }).code
                  : "undefined";
                declarations[key] = value;
              }
            });
          } else if (path.node.declaration.type === "FunctionDeclaration") {
            const { id, params, body, async } = path.node.declaration;
            if (id) {
              const arrowFunction = t.arrowFunctionExpression(
                params,
                body,
                async,
              );
              path.replaceWith(
                t.variableDeclaration("const", [
                  t.variableDeclarator(t.identifier(id.name), arrowFunction),
                ]),
              );
              declarations[id.name] = generate(arrowFunction, {
                concise: false,
              }).code;
            }
          }
        } else if (path.node.specifiers) {
          // Para exportações de variáveis ou funções já declaradas
          path.node.specifiers.forEach((specifier) => {
            declarations[specifier.exported.name] = specifier.local.name;
          });
        }
      },
    });

    return declarations;
  } catch (error) {
    console.log(code);
    throw new Error(`File: ${filePath}: ${error}`);
  }
}

module.exports = transformAndGetFunctionExportDeclarations;
