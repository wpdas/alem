const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;
const { default: traverse } = require("@babel/traverse");
const { create_new_name } = require("../../utils");

function escapeRegexContent(regex) {
  // Escapa todos os backslashes primeiro para evitar duplicação
  let escapedRegex = regex.replace(/\\/g, "\\\\");

  // Agora escapa todos os backticks
  escapedRegex = escapedRegex.replace(/`/g, "\\`");

  return escapedRegex;
}

function replaceRegexWithReferences(code) {
  const regexExpressions = {};
  let ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    RegExpLiteral(path) {
      const { pattern, flags } = path.node;
      const regex = new RegExp(pattern, flags);
      const referenceId = `:::${create_new_name()}:::`;
      regexExpressions[referenceId] = escapeRegexContent(regex.toString());

      // Replace the RegExpLiteral with the reference ID
      path.replaceWith({
        type: "StringLiteral",
        value: referenceId,
      });
    },
  });

  const output = generate(ast, {
    retainLines: true,
    concise: false,
    comments: true,
  });

  return {
    code: output.code,
    expressions: regexExpressions,
    hasExpressions: Object.keys(regexExpressions).length > 0,
  };
}

module.exports = replaceRegexWithReferences;
