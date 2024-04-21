/**
 * Recurso criado para melhorar o desempenho durante o desenvolvimento e ler novamente somente
 * os arquivos que foram alterados.
 */

const fs = require("fs");

const filesContentCache = {};

const getFileContent = (filePath) => {
  // First, try to return the cached content
  if (filesContentCache[filePath]) {
    return filesContentCache[filePath];
  }

  // If there's no cache, read file, save cache and return the file content
  let fileContent = fs.readFileSync(filePath, "utf8");
  filesContentCache[filePath] = fileContent;

  return fileContent;
};

const updateFileContent = (filePath) => {
  // Read file and save in cache
  let fileContent = fs.readFileSync(filePath, "utf8");
  filesContentCache[filePath] = fileContent;
};

module.exports = {
  getFileContent,
  updateFileContent,
};
