const fs = require("fs");
const path = require("path");
const { ALEM_VM_FOLDER } = require("../constants");
const { process_file } = require("../parse");
const getMainWidgetName = require("./getMainWidgetName");
const { read_alem_config } = require("../config");

/**
 * Cria o Widget Suspense para servir como loading para o Widget principal
 *
 * @param {*} opts Opcoes da CLI
 */
const createSuspenseWidget = (opts) => {
  const mainWidgetName = getMainWidgetName();
  const config = read_alem_config();
  // console.log(config);
  // console.log(opts);

  // Configurable: Cria somente se "createLoaderWidget" for true
  if (config.options.createLoaderWidget) {
    const account =
      opts.network === "mainnet"
        ? config.mainnetAccount
        : config.testnetAccount;
    const mainWidgetSrc = `${account}/widget/${mainWidgetName}`;

    let loadingComponent = "";
    let loadingComponentJSX = "<Loading />";

    if (
      config.options.loadingComponentFile &&
      config.options.loadingComponentName
    ) {
      const loadingComponentFilePath = path.join(
        ".",
        config.options.loadingComponentFile,
      );
      loadingComponent = process_file(loadingComponentFilePath);
      loadingComponentJSX = `<${config.options.loadingComponentName} />`;
    } else {
      loadingComponent = process_file(
        path.join(__dirname, "../", ALEM_VM_FOLDER, "components/Loading.jsx"),
      );
    }

    let suspenseFile = process_file(
      path.join(__dirname, "../", ALEM_VM_FOLDER, "components/Suspense.jsx"),
    );

    // Suspense parts
    suspenseFile = suspenseFile
      .replace(":::MAIN_WIDGET_SOURCE:::", mainWidgetSrc)
      .replace(`":::LOADING_COMPONENT:::";`, loadingComponent)
      .replace(`":::LOADING_COMPONENT_JSX"`, loadingComponentJSX);

    fs.writeFileSync(
      path.join(`./build/src/${mainWidgetName}Loader.jsx`),
      suspenseFile,
    );
  }
};

module.exports = createSuspenseWidget;
