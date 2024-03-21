const path = require("path");
const { process_file } = require("../parse");
const { for_rfile } = require("../utils");
const { ALEM_VM_FOLDER } = require("../contants");
const importableAlemFileSchemas = require("./importableAlemFileSchemas");

const loadHeaderFilesContent = () => {
  // State
  let bundleFileBody = process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "state.ts"),
  );

  // // Utils
  // let bundleFileBody_ = process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "utils.js"),
  // );

  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "utils.ts"),
  // );

  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "watchers.ts"),
  // );

  // // Components
  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "components.jsx"),
  // );

  // // State manager
  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "stateManager.jsx"),
  // );

  // // Route header items (consts, lets, vars, functions)
  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "routeHeaderItems.js"),
  // );

  // // Routes manager
  // bundleFileBody += transformFileToWidget(
  //   path.join(__dirname, TOOLS_FOLDER, "Routes.tsx"),
  // );

  // // RouteLink
  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "RouteLink.tsx"),
  // );

  // // Hooks
  // bundleFileBody += process_file(
  //   path.join(__dirname, TOOLS_FOLDER, "hooks.ts"),
  // );

  // Check if AlemSpinner should be used
  // TODO: Se persistencia ligado
  // if (!config?.options?.showFallbackSpinner) {
  //   bundleFileBody = bundleFileBody.replace(
  //     "return <AlemSpinner />;",
  //     'return "";',
  //   );
  // }

  // Load .CSS files
  // Loop through all .css files inside the './src' and get their content
  bundleFileBody += "const alemCssBody = `";
  for_rfile(path.join(".", "src"), ["css", "sass"], (file) => {
    const fileBody = process_file(file);
    bundleFileBody += fileBody;
  });
  bundleFileBody += "`;";

  // Theme
  bundleFileBody += process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "components", "AlemTheme.jsx"),
  );

  return bundleFileBody;
};

/**
 * Criar o indexador do projeto
 * @returns
 */
const loadIndexerContent = () => {
  return process_file(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "components", "AppIndexer.jsx"),
  );
};

module.exports = {
  importableAlemFileSchemas,
  loadHeaderFilesContent,
  loadIndexerContent,
};
