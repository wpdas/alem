const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const presetReact = require("@babel/preset-react");

/**
 * Extrai os spreads da estrutura de um JSX
 * Exemplo, dado de entrada: <BodyHeader accountId={accountId} projectId={projectId} profile={props.profile} {...foo} {...{foobar: 1, ...foo}}><p>oi</p></BodyHeader>
 * Saída: [ '{...foo}', '{...{ foobar: 1, ...foo }}' ]
 *
 * @param {*} jsxString
 * @returns
 */
function extractSpreadsFromJSX(jsxString) {
  let spreads = [];

  const ast = babel.parse(jsxString, {
    presets: [presetReact],
  });

  traverse(ast, {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attr) => {
        if (t.isJSXSpreadAttribute(attr)) {
          // Handles spread attributes
          const spreadCode = `...${
            generate(attr.argument, { concise: true }).code
          }`;
          spreads.push(spreadCode);
        }
      });

      path.stop(); // Stops after the first JSX element
    },
  });

  return spreads;
}

module.exports = extractSpreadsFromJSX;
