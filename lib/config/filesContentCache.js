/**
 * Recurso criado para melhorar o desempenho durante o desenvolvimento e ler novamente somente
 * os arquivos que foram alterados.
 */

const fs = require("fs");
const stateless_renamePropsTo__props__ = require("./cache-plugins/stateless_renamePropsTo__props__");

const filesContentCache = {};

// TODO: usar esse processo para processar os arquivos apenas uma vez
const runPlugins = (code) => {
  code = stateless_renamePropsTo__props__(code);
  return code;
};

const getFileContent = (filePath) => {
  // First, try to return the cached content
  if (filesContentCache[filePath]) {
    return filesContentCache[filePath];
  }

  // If there's no cache, read file, save cache and return the file content
  let fileContent = fs.readFileSync(filePath, "utf8");

  // Run plugins
  fileContent = runPlugins(fileContent);

  // Store
  filesContentCache[filePath] = fileContent;

  return fileContent;
};

const updateFileContent = (filePath) => {
  // Javascript / Typescript files only
  if (
    filePath.endsWith(".ts") ||
    filePath.endsWith(".tsx") ||
    filePath.endsWith(".js") ||
    filePath.endsWith(".jsx")
  ) {
    // Read file and save in cache
    let fileContent = fs.readFileSync(filePath, "utf8");

    // Run plugins
    fileContent = runPlugins(fileContent);

    // Store
    filesContentCache[filePath] = fileContent;
  }
};

module.exports = {
  getFileContent,
  updateFileContent,
};
