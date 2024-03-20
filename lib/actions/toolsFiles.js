const path = require("path");
const { process_file } = require("../parse");
const { read_bos_config } = require("../config");
const { for_rfile } = require("../utils");
const transformFileToFileSchema = require("./transformFileToFileSchema");
const loadFilesContent = require("./loadFilesContent");

const TOOLS_FOLDER = "../tools";
const ALEM_VM_FOLDER = "../alem-vm";

const loadHeaderFilesContent = () => {
  const config = read_bos_config();

  // State
  let bundleFileBody = process_file(
    path.join(__dirname, ALEM_VM_FOLDER, "state.ts"),
  );

  // Components
  // const routesSchema = transformFileToFileSchema(
  //   path.join(__dirname, ALEM_VM_FOLDER, "components", "Routes.tsx"),
  // );
  // const routeLinkSchema = transformFileToFileSchema(
  //   path.join(__dirname, ALEM_VM_FOLDER, "components", "RouteLink.tsx"),
  // );

  // let alemWidgetsCodes = loadFilesContent.loadComponentCodesObjectByFileSchemas(
  //   [routesSchema, routeLinkSchema],
  // ).componentsCodes;

  // // // Insere os códigos dos Além Widgets nas props globais
  // bundleFileBody = bundleFileBody.replace(
  //   "/**:::ALEM_COMPONENTS_CODE:::*/",
  //   alemWidgetsCodes,
  // );

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
    path.join(__dirname, ALEM_VM_FOLDER, "components", "AlemTheme.jsx"),
  );

  return bundleFileBody;
};

/**
 * Criar o indexador do projeto
 * @returns
 */
const loadIndexerContent = () => {
  return process_file(
    path.join(__dirname, ALEM_VM_FOLDER, "components", "AppIndexer.jsx"),
  );
};

module.exports = {
  loadHeaderFilesContent,
  loadIndexerContent,
};
