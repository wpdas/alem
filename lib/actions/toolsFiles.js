const path = require("path");
const { process_file } = require("../parse");
const { read_bos_config } = require("../config");
const { for_rfile } = require("../utils");

const TOOLS_FOLDER = "../tools";

const loadHeaderFilesContent = () => {
  const config = read_bos_config();

  // Utils
  let bundleFileBody = process_file(
    path.join(__dirname, TOOLS_FOLDER, "utils.js"),
  );

  // Components
  bundleFileBody += process_file(
    path.join(__dirname, TOOLS_FOLDER, "components.jsx"),
  );

  // State manager
  bundleFileBody += process_file(
    path.join(__dirname, TOOLS_FOLDER, "stateManager.jsx"),
  );

  // Routes manager
  bundleFileBody += process_file(
    path.join(__dirname, TOOLS_FOLDER, "routes.jsx"),
  );

  // Hooks
  bundleFileBody += process_file(
    path.join(__dirname, TOOLS_FOLDER, "hooks.js"),
  );

  // Check if AlemSpinner should be used
  if (!config?.options?.showFallbackSpinner) {
    bundleFileBody = bundleFileBody.replace(
      "return <AlemSpinner />;",
      'return "";',
    );
  }

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
    path.join(__dirname, TOOLS_FOLDER, "theme.jsx"),
  );

  return bundleFileBody;
};

const loadIndexerContent = () => {
  return process_file(path.join(__dirname, TOOLS_FOLDER, "appIndexer.jsx"));
};

module.exports = {
  loadHeaderFilesContent,
  loadIndexerContent,
};