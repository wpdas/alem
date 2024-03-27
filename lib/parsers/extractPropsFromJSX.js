const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
// const generator = require("@babel/generator").default;
const generate = require("@babel/generator").default;
const presetReactPath = require("./presetReactPath");

// function generateCodeFromAst(astNode) {
//   // Does not transform childrens or props that receives components to
//   // React.createElement
//   const { code } = generator(astNode, {});
//   return code;
// }

function extractPropsFromJSX(jsxString) {
  let propsObject = {};

  // Analisa o código JSX para AST
  const ast = babel.parse(jsxString, {
    presets: [presetReactPath],
  });

  // Percorre a AST para encontrar elementos JSX e suas propriedades
  traverse(ast, {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attr) => {
        if (babel.types.isJSXAttribute(attr)) {
          const key = attr.name.name;
          let value;

          // Trata strings literais especialmente, envolvendo-as com {}
          if (babel.types.isStringLiteral(attr.value)) {
            value = `"${attr.value.value}"`;
          } else if (babel.types.isJSXExpressionContainer(attr.value)) {
            // Para expressões, gera o código diretamente
            value = generate(attr.value.expression, { concise: true }).code;
          } else {
            // Se o valor não for uma string literal ou expressão, trata de forma genérica
            // Isso pode incluir outros tipos como JSXElement, para os quais você pode querer expandir esta lógica
            value = attr.value
              ? generate(attr.value, { concise: true }).code
              : true; // Booleano true para props sem valor
          }

          propsObject[key] = value;
        }
      });

      // Interrompe a travessia para evitar processamento desnecessário
      path.stop();
    },
  });

  return propsObject;
}

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
//             // value = generateExpression(attr.value.expression);
//             value = generateCodeFromAst(attr.value.expression);

//             if (!babel.types.isStringLiteral(attr.value.expression)) {
//               value = `${value}`; // Assegura a representação como template literal
//             }
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

// function generateExpression(expression) {
//   if (
//     babel.types.isIdentifier(expression) ||
//     babel.types.isLiteral(expression)
//   ) {
//     return expression.name || expression.value;
//   } else if (
//     babel.types.isObjectExpression(expression) ||
//     babel.types.isArrayExpression(expression)
//   ) {
//     const generatedCode = generateCodeFromAst(expression);
//     return generatedCode.startsWith("(") && generatedCode.endsWith(")")
//       ? generatedCode.slice(1, -1)
//       : generatedCode;
//   } else if (babel.types.isJSXElement(expression)) {
//     const openingElementName = expression.openingElement.name.name;
//     return `<${openingElementName} />`;
//   }
//   // Retorna nulo por padrão para expressões não manipuladas
//   return null;
// }

// function generateCodeFromAst_(astNode) {
//   const { code } = babel.transformFromAstSync(
//     babel.types.program([babel.types.expressionStatement(astNode)]),
//     null,
//     {
//       presets: [presetReactPath],
//       code: true,
//       ast: false,
//     },
//   );
//   return code.replace(/;$/, "");
// }

module.exports = extractPropsFromJSX;
