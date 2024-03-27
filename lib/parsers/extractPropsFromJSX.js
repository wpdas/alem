const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const presetReactPath = require("./presetReactPath");

// function extractPropsFromJSX(jsxString) {
//   let propsObject = {};
//   const ast = babel.parse(jsxString, { presets: [presetReactPath] });

//   traverse(ast, {
//     JSXOpeningElement(path) {
//       path.node.attributes.forEach((attr) => {
//         if (babel.types.isJSXAttribute(attr)) {
//           let key = attr.name.name;
//           let value;

//           // Se o atributo JSX não tiver valor, interprete como true
//           if (!attr.value) {
//             value = true;
//           } else if (babel.types.isJSXExpressionContainer(attr.value)) {
//             value = generateExpression(attr.value.expression);
//           } else if (babel.types.isStringLiteral(attr.value)) {
//             value = attr.value.value;
//           }

//           propsObject[key] = value;
//         }
//       });

//       // Previne a travessia para elementos JSX aninhados
//       path.stop();
//     },
//   });

//   return propsObject;
// }

function generateCodeFromAst(astNode) {
  // Does not transform childrens or props that receives components to
  // React.createElement
  const { code } = generator(astNode, {});
  return code;
}

function extractPropsFromJSX(jsxString) {
  let propsObject = {};
  const ast = babel.parse(jsxString, { presets: [presetReactPath] });

  traverse(ast, {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attr) => {
        if (babel.types.isJSXAttribute(attr)) {
          let key = attr.name.name;
          let value;

          // Se o atributo JSX não tiver valor, interprete como true
          if (!attr.value) {
            value = true;
          } else if (babel.types.isJSXExpressionContainer(attr.value)) {
            // value = generateExpression(attr.value.expression);
            value = generateCodeFromAst(attr.value.expression);

            if (!babel.types.isStringLiteral(attr.value.expression)) {
              value = `${value}`; // Assegura a representação como template literal
            }
          } else if (babel.types.isStringLiteral(attr.value)) {
            value = attr.value.value;
          }

          propsObject[key] = value;
        }
      });

      // Previne a travessia para elementos JSX aninhados
      path.stop();
    },
  });

  return propsObject;
}

function generateExpression(expression) {
  if (
    babel.types.isIdentifier(expression) ||
    babel.types.isLiteral(expression)
  ) {
    return expression.name || expression.value;
  } else if (
    babel.types.isObjectExpression(expression) ||
    babel.types.isArrayExpression(expression)
  ) {
    const generatedCode = generateCodeFromAst(expression);
    return generatedCode.startsWith("(") && generatedCode.endsWith(")")
      ? generatedCode.slice(1, -1)
      : generatedCode;
  } else if (babel.types.isJSXElement(expression)) {
    const openingElementName = expression.openingElement.name.name;
    return `<${openingElementName} />`;
  }
  // Retorna nulo por padrão para expressões não manipuladas
  return null;
}

function generateCodeFromAst_(astNode) {
  const { code } = babel.transformFromAstSync(
    babel.types.program([babel.types.expressionStatement(astNode)]),
    null,
    {
      presets: [presetReactPath],
      code: true,
      ast: false,
    },
  );
  return code.replace(/;$/, "");
}

module.exports = extractPropsFromJSX;
