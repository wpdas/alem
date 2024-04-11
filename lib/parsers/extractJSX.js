const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const pluginSyntaxJsx = require("./pluginSyntaxJsx");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

/**
 * Extracts the JSX contents only from file
 *
 * Isso retorna uma lista dos prinpais elementos JSX pais.
 *
 * @param {string} code
 * @returns
 */
function extractJSX(code) {
  // V4 - Corrige erro onde verificacao de arrow functions para retorno de JSX estava sendo feito
  // dentro do useEffect em sua funcao de limpeza.
  let jsxList = [];

  const ast = babel.parseSync(code, {
    presets: [presetReactPath],
    plugins: [pluginSyntaxJsx], // Assegura o suporte adequado para JSX
  });

  traverse(ast, {
    ReturnStatement(path) {
      // Esta verificação garante que estamos capturando retornos de componentes ou funções
      // e não de hooks como useEffect
      if (
        (path.getFunctionParent().isArrowFunctionExpression() &&
          path.getFunctionParent().parentPath.isVariableDeclarator()) ||
        path.getFunctionParent().isFunctionExpression() ||
        path.getFunctionParent().isFunctionDeclaration()
      ) {
        const jsxAST = path.node.argument;

        // Verifica se o retorno é um elemento JSX
        if (
          jsxAST &&
          (jsxAST.type === "JSXElement" || jsxAST.type === "JSXFragment")
        ) {
          const jsxCode = generate(jsxAST, { concise: true }).code;
          jsxList.push(jsxCode);
        }
      }
    },
    ArrowFunctionExpression(path) {
      if (
        path.node.body.type === "JSXElement" ||
        path.node.body.type === "JSXFragment"
      ) {
        const jsxCode = generate(path.node.body, { concise: true }).code;
        jsxList.push(jsxCode);
      }
    },
  });

  return jsxList;
}

// function extractJSX(code) {
//   // V3
//   // Retorna uma lista de elementos JSX. Entao se caso dentro da funçao for
//   // encontrado mais de uma ocorrencia, retorna ambos.
//   // Isso acontece em casos como do arquivo RouteLink que dependendo de uma comparação
//   // retorna um grupo de jsx ou outro grupo de jsx.
//   // Nessa versao 3, também retorna JSX que estão envoltos em arrow functions sem {};

//   let jsxList = [];

//   // Analisa o código para AST
//   const ast = babel.parseSync(code, {
//     presets: [presetReactPath],
//   });

//   // Percorre a AST para encontrar JSX
//   traverse(ast, {
//     ReturnStatement(path) {
//       if (
//         path.getFunctionParent().isArrowFunctionExpression() ||
//         path.getFunctionParent().isFunctionExpression() ||
//         path.getFunctionParent().isFunctionDeclaration()
//       ) {
//         const jsxAST = path.node.argument;
//         if (jsxAST) {
//           const jsxCode = generate(jsxAST, { concise: true }).code;
//           jsxList.push(jsxCode);
//         }
//       }
//     },
//     ArrowFunctionExpression(path) {
//       // Verifica se o corpo é um JSXElement ou JSXFragment
//       if (
//         path.node.body.type === "JSXElement" ||
//         path.node.body.type === "JSXFragment"
//       ) {
//         const jsxCode = generate(path.node.body, { concise: true }).code;
//         jsxList.push(jsxCode);
//       }
//     },
//   });

//   return jsxList;
// }

// function extractJSX(code) {
//   // V2 = Retorna uma lista de elementos JSX. Entao se caso dentro da funçao for
//   // encontrado mais de uma ocorrencia, retorna ambos.
//   // Isso acontece em casos como do arquivo RouteLink que dependendo de uma comparação
//   // retorna um grupo de jsx ou outro grupo de jsx
//   let jsxList = [];

//   // Analisa o código para AST
//   const ast = babel.parse(code, {
//     presets: [presetReactPath],
//   });

//   // Percorre a AST para encontrar o JSX retornado pela função do componente
//   traverse(ast, {
//     ReturnStatement(path) {
//       // Verifica se o retorno está dentro de uma função relevante (ArrowFunctionExpression ou outras)
//       if (
//         path.getFunctionParent().isArrowFunctionExpression() ||
//         path.getFunctionParent().isFunctionExpression() ||
//         path.getFunctionParent().isFunctionDeclaration()
//       ) {
//         const jsxAST = path.node.argument;

//         // Gera código JSX a partir da subárvore AST e adiciona à lista
//         const jsxCode = generate(jsxAST, { concise: true }).code;
//         jsxList.push(jsxCode);
//         // Não chama path.stop() para continuar a travessia e encontrar outros JSX
//       }
//     },
//   });

//   // return jsx;
//   return jsxList;
// }

// function extractJSX(code) {
//   let jsx = null;

//   // Analisa o código para AST
//   const ast = babel.parse(code, {
//     presets: [presetReactPath],
//   });

//   // Percorre a AST para encontrar o JSX retornado pela função do componente
//   traverse(ast, {
//     ReturnStatement(path) {
//       // Verifica se o retorno está dentro de uma ArrowFunctionExpression
//       if (path.getFunctionParent().isArrowFunctionExpression()) {
//         const jsxAST = path.node.argument;

//         // Gera código JSX a partir da subárvore AST
//         jsx = generate(jsxAST).code;
//         path.stop(); // Interrompe a travessia após encontrar o primeiro JSX
//       }
//     },
//   });

//   return jsx;
// }

module.exports = extractJSX;
