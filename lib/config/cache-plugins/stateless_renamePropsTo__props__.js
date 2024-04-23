const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const hasWidgetPropsCheck = require("../../actions/hasWidgetPropsCheck");
const generate = require("@babel/generator").default;

/**
 * Troca o nome de objeto global "props" para "__props__" para que as props do Widget parent não seja sobrescrevido.
 * @param {*} code
 * @returns
 */
function stateless_renamePropsTo__props__(code) {
  // Stateless components only
  if (!hasWidgetPropsCheck(code)) {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      ArrowFunctionExpression(path) {
        // Procura por parâmetros chamados 'props'
        path.node.params.forEach((param) => {
          if (t.isIdentifier(param) && param.name === "props") {
            // Renomeia para '__props__'
            param.name = "__props__";
            // Renomeia todas as referências dentro do escopo da função
            const binding = path.scope.getBinding("props");
            if (binding) {
              binding.referencePaths.forEach((refPath) => {
                refPath.node.name = "__props__";
              });
            }
          }
        });
      },
      FunctionDeclaration(path) {
        // Similar ao ArrowFunctionExpression
        path.node.params.forEach((param) => {
          if (t.isIdentifier(param) && param.name === "props") {
            param.name = "__props__";
            const binding = path.scope.getBinding("props");
            if (binding) {
              binding.referencePaths.forEach((refPath) => {
                refPath.node.name = "__props__";
              });
            }
          }
        });
      },
    });

    return generate(ast, { retainLines: true, concise: false }).code;
  }

  return code;
}

module.exports = stateless_renamePropsTo__props__;
