const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

// Adiciona parentesis para embrulhar o novo elemento JSX
function wrapJSXReturnWithParentheses(code) {
  const ast = babel.parse(code, {
    presets: ["@babel/preset-react"],
  });

  let newCode = ""; // Inicializa a variável que armazenará o novo código

  traverse(ast, {
    ReturnStatement(path) {
      if (
        path.node.argument.type === "JSXElement" ||
        path.node.argument.type === "JSXFragment"
      ) {
        // Extrai a posição inicial e final do JSX retornado
        const { start, end } = path.node.argument;

        // Gera o código apenas para o argumento do return
        const returnArgumentCode = generate(path.node.argument, {}).code;

        // Constrói o novo código com o return envolto por parênteses
        newCode =
          code.substring(0, start - 7) + // Extrai tudo antes do 'return'
          "return (" +
          returnArgumentCode +
          ")" + // Adiciona 'return (' + JSX + ')'
          code.substring(end); // Adiciona tudo após o JSX

        // Remove o ponto e vírgula extra se existir
        newCode = newCode.replace(/\);;/g, ");");
      }
    },
  });

  // Retorna o novo código se uma substituição foi feita, caso contrário, retorna o código original
  return newCode ? newCode : code;
}

/**
 * Replace the First JSX Element
 *
 * Usado para trocar um elemento JSX inteiro por outro.
 *
 * @param {string} code complete jsx code content
 * @param {string} newJSX the new jsx code to be inserted
 * @returns
 */
function replaceFirstJSXElement(code, newJSX) {
  const ast = babel.parse(code, {
    presets: ["@babel/preset-react"],
  });

  const newJSXAst = babel.parse(newJSX, {
    presets: ["@babel/preset-react"],
  }).program.body[0].expression;

  let replaced = false;

  traverse(ast, {
    ReturnStatement(path) {
      if (
        !replaced &&
        (path.get("argument").isJSXElement() ||
          path.get("argument").isJSXFragment())
      ) {
        // Substitui o argumento do return pelo novo JSX Fragment
        path.node.argument = newJSXAst;
        replaced = true;
      }
    },
  });

  // Se nenhum elemento JSX foi substituído, retorna o código original
  if (!replaced) {
    return code;
  }

  // Gera o novo código a partir do AST modificado
  const output = generate(ast, {
    retainLines: true,
    concise: true,
    // O Babel por padrão não adiciona parênteses aqui, então é mais uma questão de formatação do que AST
  });

  return wrapJSXReturnWithParentheses(output.code);
}

module.exports = replaceFirstJSXElement;
