const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const nodePath = require("path");
const sharp = require("sharp");

function isImageFile(filePath) {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
  return imageExtensions.includes(nodePath.extname(filePath).toLowerCase());
}

async function getBase64(filePath, quality = 80) {
  const fileBuffer = await sharp(filePath)
    .resize({ width: 800 }) // Adjust the size as needed
    .jpeg({ quality }) // Adjust the quality as needed
    .toBuffer();

  return `data:image/${nodePath
    .extname(filePath)
    .slice(1)};base64,${fileBuffer.toString("base64")}`;
}

/**
 * Processo que captura os imports de imagens e guarda seu conteúdo em base64 para
 * ser usado posteriormente no processo do compilador.
 * @param {*} code
 * @param {*} fileDir
 * @param {*} quality
 * @returns
 */
async function processImportsToBase64(code, fileDir, quality) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const imageImports = [];

  const promises = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      const importName = path.node.specifiers[0].local.name;
      const fullImportPath = nodePath.resolve(
        nodePath.dirname(fileDir),
        importPath,
      );

      if (isImageFile(fullImportPath)) {
        promises.push(
          getBase64(fullImportPath, quality).then((base64Content) => {
            imageImports.push({
              imageKey: importName,
              imageBase64Content: base64Content,
            });
          }),
        );
      }
    },
  });

  await Promise.all(promises);
  return imageImports;
}

module.exports = processImportsToBase64;
