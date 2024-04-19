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
  // Checks if the identifier is used in an array, or as an object property value, or directly assigned to a variable
  return (
    path.parentPath.isObjectProperty({ value: path.node }) ||
    path.parentPath.isArrayExpression() ||
    path.parentPath.isVariableDeclarator({ init: path.node })
  );
}

module.exports = transformComponentReferenceToJSX;
