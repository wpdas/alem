const { create_dist, log } = require("./utils");
const path = require("path");
const fs = require("fs");
const loadFilesInfo = require("./actions/loadFilesInfo");
const toolsFiles = require("./actions/toolsFiles");
const loadFilesContent = require("./actions/loadFilesContent");
const {
  removeComments,
  removeBlankLines,
  applyEnvironment,
  parseOptions,
  minify,
} = require("./parse");
const saveFinalBundleFile = require("./actions/saveFinalBundleFile");
const addSignatures = require("./actions/addSignatures");
const parseAlemFeatures = require("./actions/parseAlemFeatures");

const distFolder = process.env.DIST_FOLDER || "build";

function compile_files() {
  create_dist(distFolder);

  // TODO: Voltar o index para o src/index.tsx e forçar ele como Widget
  // no compilador
  let entryFile = path.join(".", "src", "index.tsx");
  entryFile = fs.existsSync(entryFile)
    ? entryFile
    : path.join(".", "src", "index.jsx");
  if (!fs.existsSync(entryFile)) {
    log.error("src/index.tsx or src/index.jsx not found.");
    process.exit(1);
  }

  // TEST
  // #1 - Load imported files content
  // NOTE: Fazer isso recursivo, carregando o conteudo de todos os arquivos
  // e fazer todo o processo de carga dnv

  const filesInfo = loadFilesInfo(entryFile);

  // Tools -> Header contents
  let bundleContent = toolsFiles.loadHeaderFilesContent();

  // TEMP
  // saveFinalBundleFile(bundleContent);
  // return;

  // Load App files content
  // bundleContent += loadFilesContent(filesInfo.orderedFilesToImport);
  let filesContent = loadFilesContent.loadFilesContentByFileSchemas(
    filesInfo.fileSchemas,
  );

  // Troca os recursos do Alem importados para usar o props.alem.<recurso>
  filesContent = parseAlemFeatures(filesContent);

  bundleContent += filesContent;

  // Tools -> Indexer
  bundleContent += toolsFiles.loadIndexerContent();

  // Remove the remaining comments
  // bundleContent = removeComments(bundleContent);

  // Remove blank lines
  // bundleContent = removeBlankLines(bundleContent);

  // Apply ports - works for development only
  // this won't affect production because the state of enviroment is going to be
  // production
  bundleContent = applyEnvironment(bundleContent);

  // Apply changes depending of the config.options
  // TODO: Se tiver State.init({}) no arquivo index do dev, deve pegar o conteúdo e jogar dentro
  // TODO: do conteúdo /**:::STATE.INIT:::*/ do arquivo state.ts
  bundleContent = parseOptions(bundleContent);

  // Mimify
  // bundleContent = minify(bundleContent);

  // Add sinatures
  bundleContent = addSignatures(bundleContent);

  // Save final bundle file
  saveFinalBundleFile(bundleContent);
}

module.exports = {
  compile_files,
};
