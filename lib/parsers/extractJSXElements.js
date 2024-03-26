const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const presetReactPath = require("./presetReactPath");

/**
 * Extract JSX Elements and return an array with them
 *
 * E.g:
 *
 * ```tsx
 * extractJSXElements('html content here', 'Footer').
 * ```
 *
 * @param {string} code complete html bundle file
 * @param {string | undefined} filterByElementType (optional) jsx element to extract from html bundle, if undefined it will return all elements.
 *
 * @returns
 */
function extractJSXElements(code, filterByElementType) {
  // V2
  const elements = [];

  // Parse the code to AST
  const ast = babel.parse(code, {
    presets: [presetReactPath],
  });

  // Traverse the AST to find elements of the specified type
  traverse(ast, {
    JSXElement(path) {
      // Caso tenha filtro, retorna somente os elementos que sao do nome especificado
      if (filterByElementType) {
        // Verifica se o nome do elemento corresponde ao filterByElementType
        if (path.node.openingElement.name.name === filterByElementType) {
          // Utiliza generate para extrair o código completo do elemento JSX
          const { code: elementCode } = generate(path.node);
          elements.push(elementCode);
        }
      } else {
        // Se não tiver filtro, retorna todos os elementos
        const { code: elementCode } = generate(path.node);
        elements.push(elementCode);
      }
    },
  });

  return elements;
}
// function extractJSXElements(code, elementType) {
//   const elements = [];

//   // Parse the code to AST
//   const ast = babel.parse(code, {
//     presets: [presetReactPath],
//   });

//   // Traverse the AST to find elements of the specified type
//   traverse(ast, {
//     JSXOpeningElement(path) {
//       if (path.node.name.name === elementType) {
//         const start = path.node.start;
//         const end = path.node.end;
//         const elementCode = code.substring(start, end);

//         elements.push(elementCode);
//       }
//     },
//   });

//   return elements;
// }

module.exports = extractJSXElements;
