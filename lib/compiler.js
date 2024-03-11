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
  mimify,
} = require("./parse");
const saveFinalBundleFile = require("./actions/saveFinalBundleFile");
const addSignatures = require("./actions/addSignatures");

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

  // TEST
  // #1 - Load imported files content
  // NOTE: Fazer isso recursivo, carregando o conteudo de todos os arquivos
  // e fazer todo o processo de carga dnv

  const filesInfo = loadFilesInfo(entryFile);

  console.log("Files Schema:");
  console.log(filesInfo.fileSchemas);

  console.log("orderedFilesToImport", filesInfo.orderedFilesToImport);

  // NOTE
  /**
   * Se essa ordem abaixo nao funcionar, mudar a hierarquia de carga pra carregar
   * linearmente todo os items do arquivo sendo processado.
   */
  // console.log("\n\n");
  // console.log("Ordered Files to Import:");
  // console.log(filesInfo.orderedFilesToImport);

  // Tools -> Header contents
  let bundleContent = toolsFiles.loadHeaderFilesContent();

  // Load App files content
  // bundleContent += loadFilesContent(filesInfo.orderedFilesToImport);
  bundleContent += loadFilesContent(filesInfo.fileSchemas);

  // Tools -> Indexer
  bundleContent += toolsFiles.loadIndexerContent();

  // Remove the remaining comments
  bundleContent = removeComments(bundleContent);

  // Remove blank lines
  bundleContent = removeBlankLines(bundleContent);

  // Apply ports - works for development only
  // this won't affect production because the state of enviroment is going to be
  // production
  bundleContent = applyEnvironment(bundleContent);

  // Apply changes depending of the config.options
  bundleContent = parseOptions(bundleContent);

  // Mimify
  bundleContent = mimify(bundleContent);

  // Add sinatures
  bundleContent = addSignatures(bundleContent);

  // Save final bundle file
  saveFinalBundleFile(bundleContent);
}

module.exports = {
  compile_files,
};
