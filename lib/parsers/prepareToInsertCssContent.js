const parser = require("@babel/parser");
const recast = require("recast");
const t = require("@babel/types");

function prepareToInsertCssContent(fileContent, alemFileCSSThemeConstName) {
  const ast = parser.parse(fileContent, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  recast.visit(ast, {
    visitReturnStatement(path) {
      this.traverse(path);
      if (
        path.value.argument &&
        (path.value.argument.type === "JSXElement" ||
          path.value.argument.type === "JSXFragment")
      ) {
        const originalJSX = path.value.argument;

        // Criar o novo JSX com o div com ID
        const wrappedJSX = t.jsxElement(
          t.jsxOpeningElement(
            // t.jsxIdentifier("AlemFileCSSTheme"),
            t.jsxIdentifier(alemFileCSSThemeConstName),
            [
              // t.jsxAttribute(
              //   t.jsxIdentifier("id"),
              //   t.stringLiteral("::CSS_CONTENT::"), // ID definido conforme solicitado
              // ),
            ],
            false,
          ),
          // t.jsxClosingElement(t.jsxIdentifier("AlemFileCSSTheme")),
          t.jsxClosingElement(t.jsxIdentifier(alemFileCSSThemeConstName)),
          [originalJSX], // Diretamente usando originalJSX sem container
          false,
        );

        // Substituir o JSX original pelo novo no AST
        path.value.argument = wrappedJSX;
      }
    },
  });

  const output = recast.print(ast, {
    reuseWhitespace: true,
    quote: "single",
  }).code;

  // INFO: Esse conteúdo é adicionado somente para arquivos que estao importando arquivos css
  // INFO2: Sao duas etapas, o primeiro é adicionar isso no inicio da leitura do arquivo, o segundo
  // passo é durante o processamento de widgets no arquivo "transformSchemaToWidget.js" que adiciona
  // o corpo do elemento "AlemFileCSSTheme" no conteúdo do arquivo

  return output;
}

module.exports = prepareToInsertCssContent;
