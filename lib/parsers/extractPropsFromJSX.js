const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const presetReactPath = require("./presetReactPath");

function extractPropsFromJSX(jsxString) {
  // V2
  let propsObject = {};

  const ast = babel.parse(jsxString, {
    presets: [presetReactPath],
  });

  traverse(ast, {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attr) => {
        if (babel.types.isJSXAttribute(attr)) {
          // Trata atributos JSX normais
          const key = attr.name.name;
          let value;
          if (babel.types.isStringLiteral(attr.value)) {
            value = `"${attr.value.value}"`;
          } else if (babel.types.isJSXExpressionContainer(attr.value)) {
            value = generate(attr.value.expression, { concise: true }).code;
          } else {
            value = attr.value
              ? generate(attr.value, { concise: true }).code
              : true;
          }
          propsObject[key] = value;
        } else if (babel.types.isJSXSpreadAttribute(attr)) {
          // Trata a propagação de objetos
          if (babel.types.isObjectExpression(attr.argument)) {
            attr.argument.properties.forEach((prop) => {
              if (babel.types.isObjectProperty(prop)) {
                const key = prop.key.name || prop.key.value; // Suporta tanto propriedades identificadas por nome quanto por valor
                const value = generate(prop.value, { concise: true }).code;
                propsObject[key] = value;
              }
            });
          }
        }
      });

      path.stop(); // Interrompe após o primeiro elemento JSX
    },
  });

  return propsObject;
}

// function extractPropsFromJSX(jsxString) {
//   let propsObject = {};

//   // Analisa o código JSX para AST
//   const ast = babel.parse(jsxString, {
//     presets: [presetReactPath],
//   });

//   // Percorre a AST para encontrar elementos JSX e suas propriedades
//   traverse(ast, {
//     JSXOpeningElement(path) {
//       path.node.attributes.forEach((attr) => {
//         if (babel.types.isJSXAttribute(attr)) {
//           const key = attr.name.name;
//           let value;

//           // Trata strings literais especialmente, envolvendo-as com {}
//           if (babel.types.isStringLiteral(attr.value)) {
//             value = `"${attr.value.value}"`;
//           } else if (babel.types.isJSXExpressionContainer(attr.value)) {
//             // Para expressões, gera o código diretamente
//             value = generate(attr.value.expression, { concise: true }).code;
//           } else {
//             // Se o valor não for uma string literal ou expressão, trata de forma genérica
//             // Isso pode incluir outros tipos como JSXElement, para os quais você pode querer expandir esta lógica
//             value = attr.value
//               ? generate(attr.value, { concise: true }).code
//               : true; // Booleano true para props sem valor
//           }

//           propsObject[key] = value;
//         }
//       });

//       // Interrompe a travessia para evitar processamento desnecessário
//       path.stop();
//     },
//   });

//   return propsObject;
// }

module.exports = extractPropsFromJSX;
