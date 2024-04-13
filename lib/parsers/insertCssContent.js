const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

function insertCssContent(
  code,
  alemFileCssContentConstName,
  cssContentToInject,
  alemFileCSSThemeConstName,
) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "decorators-legacy",
      "optionalChaining",
      "nullishCoalescingOperator",
    ],
  });

  let added = false;

  traverse(ast, {
    enter(path) {
      if (
        !added &&
        path.isArrowFunctionExpression() &&
        path.get("body").isJSXElement()
      ) {
        path
          .get("body")
          .replaceWith(
            t.blockStatement([
              t.variableDeclaration("const", [
                t.variableDeclarator(
                  t.identifier("valor"),
                  t.stringLiteral(""),
                ),
              ]),
              t.returnStatement(path.node.body),
            ]),
          );
        added = true;
      } else if (
        !added &&
        path.isArrowFunctionExpression() &&
        path.get("body").isBlockStatement()
      ) {
        let hasJSX = path.node.body.body.some(
          (node) =>
            node.type === "ReturnStatement" &&
            node.argument &&
            node.argument.type === "JSXElement",
        );

        if (hasJSX) {
          path.node.body.body.unshift(
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.identifier(alemFileCSSThemeConstName),
                t.stringLiteral("::ALEM_FILE_CSS_THEME::"),
              ),
            ]),
          );

          path.node.body.body.unshift(
            t.variableDeclaration("const", [
              t.variableDeclarator(
                t.identifier(alemFileCssContentConstName),
                t.stringLiteral(cssContentToInject),
              ),
            ]),
          );

          added = true; // Ensure only the first component is modified
        }
      }
    },
  });

  const output = generator(ast, {
    retainLines: true, // Preserves line breaks
    concise: false, // Do not minimize the code output, better for readability
    quotes: "single", // Use single quotes for strings
    compact: false, // Do not compress the output
    minified: false, // Ensure the output is not minified
  }).code;

  return output;
}

module.exports = insertCssContent;
