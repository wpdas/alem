const babel = require("@babel/core");
const pluginSyntaxJsx = require("./pluginSyntaxJsx");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extrai elementos JSX de nível superior de um snippet JSX.
 *
 * E.g.:
 * Entrada => <>{}<Away age="2" /><p>Olá jow</p><Away age="9" comp={<span>oi</span>}> <p>Sou um child do Away!</p> </Away></>
 *
 * Retorna =>
 * [
 * '<Away age="2" />',
 * '<p>Olá jow</p>',
 * '<Away age="9" comp={<span>oi</span>}> <p>Sou um child do Away!</p> </Away>'
 *]
 *
 * @param {string} code - O código JSX a ser processado.
 * @returns {string[]} - Lista de strings representando cada elemento JSX de nível superior.
 */
function extractTopLevelJSXElements(code) {
  // V2: trata childrens que usam valores dinamicos dentro do JSX. Isso estava falhando antes
  // por não ter essa tratativa.
  const topLevelElements = [];

  // Configuração do Babel para analisar JSX
  const ast = babel.parse(code, {
    plugins: [pluginSyntaxJsx],
  });

  traverse(ast, {
    JSXFragment(path) {
      path.node.children.forEach((child) => {
        if (babel.types.isJSXElement(child) || babel.types.isJSXText(child)) {
          const { code } = generate(child, { concise: true });
          topLevelElements.push(code);
        } else if (babel.types.isJSXExpressionContainer(child)) {
          // Trata expressões dentro de containers, ex: {variable}
          const { code } = generate(child.expression, { concise: true });
          topLevelElements.push(`{${code}}`); // Adiciona chaves para simular a expressão embutida
        }
      });
      path.stop(); // Interrompe após processar os filhos do fragmento
    },
  });

  return topLevelElements;
}

// function extractTopLevelJSXElements(code) {
//   const topLevelElements = [];

//   // Configuração do Babel para analisar JSX
//   const ast = babel.parse(code, {
//     plugins: [pluginSyntaxJsx],
//   });

//   // Percorre a AST para encontrar elementos JSX de nível superior
//   traverse(ast, {
//     JSXFragment(path) {
//       // Processa cada filho direto do fragmento JSX
//       path.node.children.forEach((child) => {
//         // Ignora espaços em branco e outros nós que não são JSXElement ou JSXText
//         if (babel.types.isJSXElement(child) || babel.types.isJSXText(child)) {
//           // Gera código a partir do nó AST do elemento JSX
//           const { code } = generate(child, { concise: true });
//           topLevelElements.push(code);
//         }
//       });

//       // Interrompe a travessia após processar os filhos do fragmento JSX
//       path.stop();
//     },
//   });

//   return topLevelElements;
// }

module.exports = extractTopLevelJSXElements;
