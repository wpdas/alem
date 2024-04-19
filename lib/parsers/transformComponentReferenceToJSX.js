const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

/**
 * Transforma referencia de componentes em JSX.
 *
 * Exemplo:
 *
 * const obj = { source: MyComponent }
 * const foo = MyComponent
 * const list = [MyComponent]
 *
 * se torna
 *
 * const obj = { source: () => <MyComponent /> }
 * const foo = () => <MyComponent />
 * const list = [() => <MyComponent />]
 *
 * @param {*} code
 * @param {*} componentName
 * @returns
 */
function transformComponentReferenceToJSX(code, componentName) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    enter(path) {
      if (
        path.isIdentifier({ name: componentName }) &&
        isValidJSXContext(path)
      ) {
        const jsxElement = t.jSXElement(
          t.jSXOpeningElement(t.jSXIdentifier(componentName), [], true),
          null,
          [],
          true,
        );
        const arrowFuncExpr = t.arrowFunctionExpression([], jsxElement);
        path.replaceWith(arrowFuncExpr);
      }
    },
  });

  return generate(ast, { retainLines: true }).code;
}

function isValidJSXContext(path) {
  // Expand the check to include situations where the identifier is an argument in any function call
  if (
    path.parentPath.isObjectProperty({ value: path.node }) ||
    path.parentPath.isArrayExpression() ||
    path.parentPath.isVariableDeclarator({ init: path.node })
  ) {
    return true;
  }

  if (path.parentPath.isCallExpression()) {
    return path.parentPath.node.arguments.includes(path.node);
  }

  return false;
}

module.exports = transformComponentReferenceToJSX;
