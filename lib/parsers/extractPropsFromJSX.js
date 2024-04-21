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

module.exports = extractPropsFromJSX;
