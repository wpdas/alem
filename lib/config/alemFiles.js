const path = require("path");
const { process_file, removeComments } = require("../parse");
const { for_rfile } = require("../utils");
const { ALEM_VM_FOLDER } = require("../contants");
const importableAlemFileSchemas = require("./importableAlemFileSchemas");

const loadHeaderFilesContent = () => {
  // State
  let bundleFileBody = process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "state.ts"),
  );

  // Remove comentários do state.ts processado
  bundleFileBody = removeComments(bundleFileBody);

  // Load .CSS files
  // Loop through all .css files inside the './src' and get their content
  bundleFileBody += "const alemCssBody = `";
  for_rfile(path.join(".", "src"), ["css", "sass"], (file) => {
    const fileBody = process_file(file);
    bundleFileBody += fileBody;
  });
  bundleFileBody += "`;";

  // Theme
  const alemThemeContent = process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "components", "AlemTheme.jsx"),
  );

  bundleFileBody += removeComments(alemThemeContent);

  return bundleFileBody;
};

/**
 * Criar o indexador do projeto
 * @returns
 */
const loadIndexerContent = () => {
  const appIndexer = process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "components", "AppIndexer.jsx"),
  );

  return removeComments(appIndexer);
};

module.exports = {
  importableAlemFileSchemas,
  loadHeaderFilesContent,
  loadIndexerContent,
};
