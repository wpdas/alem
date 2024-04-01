const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Replace a JSX Element based on its index
 *
 * E.g.:
 *
 * ```tsx
 * const newIndexCode = replaceJSXElement(originalCode, "Footer", 2, "<Widget />");
 * console.log(newIndexCode);
 * ```
 *
 * @param {string} code html code
 * @param {string} elementType jsx element name to be replaced
 * @param {string} indexToReplace
 * @param {string} newElementCode
 * @returns
 */
function replaceJSXElement(code, elementType, indexToReplace, newElementCode) {
  const ast = babel.parse(code, { presets: [presetReactPath] });
  let currentIndex = 0;

  traverse(ast, {
    JSXElement(path) {
      if (path.node.openingElement.name.name === elementType) {
        if (currentIndex === indexToReplace) {
          // Parse the new element to an AST
          const newAst = babel.parse(`<div>${newElementCode}</div>`, {
            presets: [presetReactPath],
          });
          // Extract the JSX element from the new AST
          const newElementAst = newAst.program.body[0].expression.children[0];

          // Replace the current JSXElement with the new one
          path.replaceWith(newElementAst);
          path.stop(); // Stop the traversal once we've made our replacement
        }
        currentIndex++;
      }
    },
  });

  // Generate the new code from the modified AST
  const { code: newCode } = generate(ast, {
    retainLines: true,
    concise: true,
  });
  return newCode;
}

module.exports = replaceJSXElement;
