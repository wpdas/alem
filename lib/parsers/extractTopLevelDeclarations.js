const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const transformVariableInCode = require("./transformVariableInCode");

function transformFunctionDeclarations(code) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const declarations = {};

  traverse(ast, {
    FunctionDeclaration(path) {
      const { id, params, body, async } = path.node;
      if (id) {
        const arrowFunction = t.arrowFunctionExpression(params, body, async);
        path.replaceWith(
          t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier(id.name), arrowFunction),
          ]),
        );
      }
    },
    VariableDeclaration(path) {
      if (path.parent.type === "Program") {
        path.node.declarations.forEach((declaration) => {
          if (declaration.id.type === "Identifier") {
            const key = declaration.id.name;
            const value = declaration.init
              ? generate(declaration.init, { concise: false }).code
              : "undefined";
            declarations[key] = value;
          }
        });
      }
    },
  });

  return declarations;
}

/**
 * Usado para extrair as funçoes no escopo principal e retornar um objeto deles.
 * Declarações "function" são automaticamente convertidas para "arrow functions". Todas as declarações
 * são usadas, mesmo as que nao tem "export", já que elas podem depender de outras declarações dentro do arquivo
 *
 * Exemplo, dado um arquivo com esse conteúdo:
 *  `
 *  const Foo = () => {console.log('foo');};
 *   function Bar(age) {console.log('bar', age);};
 *   var My = () => {
 *     console.log('ola');
 *   }
 *
 *    const age = 2;
 *    const contract = "foobar";
 *   `
 * Tem Esse retorno:
 * {
 *   Foo: "() => { console.log('foo'); }",
 *   Bar: "function Bar(age) { console.log('bar', age); }",
 *   My: "() => { console.log('ola'); }",
 *   age: '2',
 *   contract: '"foobar"'
 * }
 *
 * @param {*} code
 * @returns
 */
function extractTopLevelDeclarations(code, modulePath) {
  const transformedCode = transformFunctionDeclarations(code);
  const declarations = transformedCode;

  // console.log("\n");
  // console.log("FILE:", modulePath);
  const referenceKeys = Object.keys(declarations);
  referenceKeys.forEach((declarationReference) => {
    // console.log("AAAA", declarationReference);
    referenceKeys.forEach((refKey) => {
      // console.log("+ --->", refKey);
      const currentValue = declarations[refKey];
      if (currentValue.includes(declarationReference)) {
        const replaced = transformVariableInCode(
          currentValue,
          declarationReference,
          ":::VAR_REF:::",
        );

        declarations[refKey] = replaced.replaceAll(
          ":::VAR_REF:::",
          `props.alem.modulesCode['${modulePath}'].${declarationReference}`,
        );
      }
    });
  });

  return declarations;
}
// function extractTopLevelFunctions(code) {
//   const ast = parser.parse(code, {
//     sourceType: "module",
//     plugins: ["jsx", "typescript"], // Habilita suporte para TypeScript e JSX
//   });

//   const functions = {};

//   traverse(ast, {
//     enter(path) {
//       if (
//         path.node.type === "FunctionDeclaration" ||
//         (path.node.type === "VariableDeclaration" &&
//           path.node.declarations[0].init &&
//           path.node.declarations[0].init.type === "ArrowFunctionExpression")
//       ) {
//         const key = path.node.id
//           ? path.node.id.name
//           : path.node.declarations[0].id.name;
//         const { code } = generate(path.node);
//         functions[key] = code;
//       }
//     },
//   });

//   return functions;
// }

module.exports = extractTopLevelDeclarations;
