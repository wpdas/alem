const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function extractExportsFromFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: [
      "typescript", // Para suportar a sintaxe TypeScript
      "jsx", // Se você também estiver usando JSX
    ],
  });

  const exports = {};
  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        const declarations = path.node.declaration.declarations;
        declarations.forEach((declaration) => {
          const exportedName = declaration.id.name;
          exports[exportedName] = true; // Simplesmente marca que o export existe. Você precisará ajustar isso com base no que você quer extrair
        });
      }
    },
    // Você pode precisar adicionar mais visitantes para cobrir outros tipos de exports, como export default, etc.
  });

  return exports;
}

module.exports = extractExportsFromFile;
