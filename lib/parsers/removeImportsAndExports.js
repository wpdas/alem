const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

/**
 * Remove linhas que tenham "import" do javascript
 * Troca "export" e "export default" por nada
 *
 * INFO: Essa é a forma mais segura
 *
 * @param {*} code
 * @returns
 */
function removeImportsAndExports(code) {
  const ast = parser.parse(code, {
    sourceType: "module", // necessário para suportar módulos ES6
    plugins: ["jsx", "typescript"], // adicione plugins se estiver usando JSX ou TypeScript
  });

  traverse(ast, {
    ImportDeclaration(path) {
      path.remove(); // Remove a declaração de importação completamente
    },
    ExportDeclaration(path) {
      if (path.node.declaration) {
        // Se a declaração de exportação possui um nó de declaração (ou seja, não é apenas 'export { something }')
        const { declaration } = path.node;
        path.replaceWith(declaration); // Substitui a exportação pela declaração contida
      } else {
        // Para exportações que são apenas exportações de variáveis, remover a palavra 'export'
        path.replaceWithMultiple(
          path.node.specifiers.map((specifier) =>
            t.variableDeclaration("let", [
              t.variableDeclarator(specifier.local),
            ]),
          ),
        );
      }
    },
    ExportDefaultDeclaration(path) {
      if (path.node.declaration) {
        // Remove apenas a palavra 'default' e mantém a declaração
        const { declaration } = path.node;
        if (
          t.isFunctionDeclaration(declaration) ||
          t.isClassDeclaration(declaration)
        ) {
          // Para funções e classes, elas precisam ser convertidas para expressões antes da remoção do 'export default'
          const expression = t.functionExpression(
            null,
            declaration.params,
            declaration.body,
            declaration.generator,
            declaration.async,
          );
          path.replaceWith(expression);
        } else {
          path.replaceWith(declaration);
        }
      }
    },
  });

  return generate(ast, { false: true }).code;
}

module.exports = removeImportsAndExports;
