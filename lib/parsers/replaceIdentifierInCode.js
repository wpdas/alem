const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Troca o nome do recurso dentro do código, tanto para o arquivo principal quanto para os arquivos que dependem
 * do arquivo original.
 *
 * Se um arquivo com nome Foo tiver seu nome trocado, isso será aplicado corretamente sem alterar
 * outros dados ou estruturas.
 *
 * Já um arquivo que depende do principal (quando esse principal é alterado) ira sofrer alterações somente
 * no nome do recurso específico. Ou sejá, se Foo for mudado para Bar, somente este item será mudado em todo o arquivo
 * incluindo JSX. Exemplo:
 *
 * import Foo from "./caminho/Foo"
 * console.log(Foo);
 * <Test>Foo<Test/>
 * <Foo />
 *
 * se tornará
 *
 * import Bar from "./caminho/Bar"
 * console.log(Bar);
 * <Test>Foo<Test/>
 * <Bar />
 *
 *
 * @param {*} code
 * @param {*} identifier
 * @param {*} newIdentifier
 * @returns
 */
function replaceIdentifierInCode(code, identifier, newIdentifier) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"], // Support for TypeScript and JSX
  });

  traverse(ast, {
    enter(path) {
      if (
        path.isIdentifier({ name: identifier }) ||
        path.isJSXIdentifier({ name: identifier })
      ) {
        path.node.name = newIdentifier;
      } else if (
        path.isImportSpecifier() &&
        path.node.imported.name === identifier
      ) {
        path.node.imported.name = newIdentifier;
      } else if (
        path.isImportDefaultSpecifier() &&
        path.node.local.name === identifier
      ) {
        path.node.local.name = newIdentifier;
      }
    },
  });

  return generate(ast, { retainLines: true }).code;
}

module.exports = replaceIdentifierInCode;
