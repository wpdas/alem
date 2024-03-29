const fs = require("fs");

/**
 * Procura por import que usem "import * as" e dispara erro
 * @param {string} filePath
 */
function checkForWildcardImports(filePath) {
  // Ler o conteúdo do arquivo
  const code = fs.readFileSync(filePath, "utf8");

  if (code.includes("import * as")) {
    return `Not supported 'import * as' statement found in file ${filePath}`;
  }

  return null;
}

module.exports = checkForWildcardImports;
