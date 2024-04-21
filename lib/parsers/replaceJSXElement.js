const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const presetTypescriptPath = require("./presetTypescriptPath");
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
  const ast = babel.parse(code, {
    presets: [presetReactPath, presetTypescriptPath],
    filename: "input.tsx", // Providing a filename for presets that require it
  });
  let currentIndex = 0;

  traverse(ast, {
    JSXElement(path) {
      if (path.node.openingElement.name.name === elementType) {
        if (currentIndex === indexToReplace) {
          const newAst = babel.parse(`<div>${newElementCode}</div>`, {
            presets: [presetReactPath, presetTypescriptPath],
            filename: "input.tsx", // Also for the new code's AST
          });
          const newElementAst = newAst.program.body[0].expression.children[0];

          path.replaceWith(newElementAst);
          path.stop();
        }
        currentIndex++;
      }
    },
  });

  const { code: newCode } = generate(ast, {
    retainLines: true, // This option tries to use the same line numbers and indents for output as input
    concise: false, // Set to false to avoid compacting the output too much
    comments: true, // Preserve comments in the output
  });
  return newCode;
}

module.exports = replaceJSXElement;
