const { create_dist, log } = require("./utils");
const path = require("path");
const fs = require("fs");
const loadFilesInfo = require("./actions/loadFilesInfo");
const alemFiles = require("./config/alemFiles");
const loadFilesContent = require("./actions/loadFilesContent");
const { removeBlankLines, applyEnvironment, minify } = require("./parse");
const saveFinalBundleFile = require("./actions/saveFinalBundleFile");
const addSignatures = require("./actions/addSignatures");
const parseAlemFeatures = require("./config/parseAlemFeatures");
const saveFileSchemas = require("./actions/saveFileSchemas");
const renderErrorDisplay = require("./actions/renderErrorDisplay");
const injectModules = require("./actions/injectModules");
const applyOptions = require("./actions/applyOptions");

const distFolder = process.env.DIST_FOLDER || "build";

function compile_files() {
  create_dist(distFolder);

  let entryFile = path.join(".", "src", "index.tsx");
  entryFile = fs.existsSync(entryFile)
    ? entryFile
    : path.join(".", "src", "index.jsx");
  if (!fs.existsSync(entryFile)) {
    log.error("src/index.tsx or src/index.jsx not found.");
    process.exit(1);
  }

  // Load project files
  const filesInfo = loadFilesInfo(entryFile);

  // Se não tiver erro
  if (filesInfo.hasError) {
    // Save bundle file with error info
    const errorDisplay = renderErrorDisplay(filesInfo.hasError);
    saveFinalBundleFile(errorDisplay);
    return;
  }

  // Load Além files content schema
  const alemImportableFilesSchema =
    alemFiles.importableAlemFileSchemas().completeFileSchemas;

  /**
   * Recebe um texto no formato:
   * NomeComponente: `codigo do componente`,
   * Componente2: `codigo do componenete`,....
   */
  const finishedSchemaProcessForWidgets =
    loadFilesContent.loadComponentCodesObjectByFileSchemas(
      filesInfo.fileSchemas,
      alemImportableFilesSchema,
    );

  if (finishedSchemaProcessForWidgets.error) {
    // Save bundle file with error info
    const errorDisplay = renderErrorDisplay(
      finishedSchemaProcessForWidgets.error,
    );
    saveFinalBundleFile(errorDisplay);
    return;
  }

  let widgetsCodes = finishedSchemaProcessForWidgets.componentsCodes;

  // Alem VM -> Header contents
  let bundleContent = alemFiles.loadHeaderFilesContent();

  // Troca os recursos do Alem importados para usar o props.alem.<recurso>
  widgetsCodes = parseAlemFeatures(widgetsCodes);

  // Insere os códigos dos Widgets nas props globais
  bundleContent = bundleContent.replace("COMPONENTS_CODE: {},", widgetsCodes);

  // Aplica as configuraçoes a partir dos options do alem.config.json
  bundleContent = applyOptions(bundleContent);

  // Tools -> Indexer
  // Adiciona o bundle do componente App dentro do Indexador: <AlemTheme> <App /> </AlemTheme>
  bundleContent += alemFiles.loadIndexerContent();

  // TODO: Verificar se vai dar continuidade a isso uma vez que é quase inútil já que a VM nao da suporte a window, document e clone functions
  // Inject CDN Libraries
  // file name: modules.json
  // Reason to not use: it's not possible to clone functions, use window or documents
  /**
   * File format
   *
   * {
   * "mathjs": {
   *    "url": "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js",
   *    "accessKey": "dayjs"
   *    }
   * }
   */
  bundleContent = injectModules(bundleContent);

  // Remove blank lines
  bundleContent = removeBlankLines(bundleContent);

  // Apply ports - works for development only
  // this won't affect production because the state of enviroment is going to be
  // production
  bundleContent = applyEnvironment(bundleContent);

  // Mimify
  if (process.env.MINIFY !== "false") {
    bundleContent = minify(bundleContent);
  }

  // Add sinatures
  bundleContent = addSignatures(bundleContent);

  // Save final bundle file
  saveFinalBundleFile(bundleContent);

  // Save final file schemas
  // INFO: dev only
  // saveFileSchemas(finishedSchemaProcessForWidgets.completeFileSchemas);
}

module.exports = {
  compile_files,
};
