const { create_dist, log, reset_name_counter } = require("./utils");
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
const injectFoundRegExps = require("./actions/injectFoundRegExps");
const createSuspenseWidget = require("./actions/createSuspenseWidget");
const { millisToMinutesAndSeconds } = require("./helpers");

const distFolder = process.env.DIST_FOLDER || "build";

/**
 * Executa os comandos finais antes de gerar o bundle e arquivos/estrutura de esquemas finais
 * @param {{hasError: null;initialFileSchemas: {filePath: any;toImport: any;content: any;}[];fileSchemas: {filePath: string;toImport: string[];content: string;}[];orderedFilesToImport: string[];}} filesInfo
 * @param {*} opts Opcoes da CLI
 * @returns
 */
function run_final_process(filesInfo, opts) {
  // Se não tiver erro
  if (filesInfo.hasError) {
    // Save bundle file with error info
    const errorDisplay = renderErrorDisplay(filesInfo.hasError);
    saveFinalBundleFile(errorDisplay);
    return;
  }

  /**
   * Recebe um texto no formato:
   * NomeComponente: `codigo do componente`,
   * Componente2: `codigo do componenete`,....
   */
  const finishedSchemaProcessForWidgets =
    loadFilesContent.loadComponentCodesObjectByFileSchemas(
      filesInfo.fileSchemas,
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
  const modulesCodes = finishedSchemaProcessForWidgets.modulesCodes;

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

  // Insere os códigos dos Módulos nas props globais
  bundleContent = bundleContent.replace("MODULES_CODE: {},", modulesCodes);

  // Inject CDN Libraries
  // file name: modules.json
  // Reason to not use: it's not possible to clone functions, use window or documents
  /**
   * File format
   *
   * {
   * "dayjs": "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js",
   * "dayjs2": "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js",
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

  // Troca as referencias de expressoes regulares com elas sendo devidamente escapadas. Isso é necessário
  // pois todas as expressoes encontradas sao extraídas para depois serem realocadas de forma formatada/escapada
  // corretamente no código final
  bundleContent = injectFoundRegExps(bundleContent);

  // Save final bundle file
  saveFinalBundleFile(bundleContent);

  // Create Suspense Widget to load the main Widget (configurable)
  createSuspenseWidget(opts);

  // Save final file schemas
  if (process.env.SAVE_SCHEMAS === "true") {
    saveFileSchemas(finishedSchemaProcessForWidgets.completeFileSchemas);
  }
}

/**
 * Le todos os arquivos independentes e compila pela primeira vez
 *
 * @param {*} opts Opcoes da CLI
 */
function compile_files(opts) {
  reset_name_counter();
  create_dist(distFolder);

  let entryFile = path.join(".", "src", "index.tsx");
  entryFile = fs.existsSync(entryFile)
    ? entryFile
    : path.join(".", "src", "index.jsx");
  if (!fs.existsSync(entryFile)) {
    log.error("src/index.tsx or src/index.jsx not found.");
    process.exit(1);
  }

  const showLogs = process.env.SHOW_EXECUTION_TIME === "true";
  if (showLogs) console.log("Starting compiler process...");
  // Load project files
  let start = Date.now();
  const filesInfo = loadFilesInfo(entryFile);
  let end = Date.now();
  if (showLogs) {
    console.log(
      `loadFilesInfo -> Execution time: ${millisToMinutesAndSeconds(end - start)} sec`,
    );
  }

  // Salva o esquema inicial. Bom para log
  fs.writeFileSync(
    path.join(`./build/filesInfo.json`),
    JSON.stringify(filesInfo.fileSchemas, null, 2),
  );

  // Executa processo final para gerar bundle e esquemas de arquivos
  run_final_process(filesInfo, opts);
}

module.exports = {
  compile_files,
};
