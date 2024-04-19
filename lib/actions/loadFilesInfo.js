const path = require("path");
const fs = require("fs");
const helpers = require("../helpers");
const handleNames = require("./handleNames");
const removeCommentsFromTSX = require("../parsers/removeCommentsFromTSX");
const checkSyntaxError = require("../parsers/checkSyntaxError");
const { log } = require("../utils");
const checkForWildcardImports = require("../parsers/checkForWildcardImports");
const compilerOptions = require("./compilerOptions");
const { isWindows } = require("../constants");
const transformComponentReferenceToJSX = require("../parsers/transformComponentReferenceToJSX");
const hasWidgetPropsCheck = require("./hasWidgetPropsCheck");
const { removeImports } = require("../parse");

/**
 * Transform statefull components references to JSX (this applies for stateful and stateless components)
 * Troca referencias de stateful components para JSX. Accesse o arquivo "transformComponentReferenceToJSX" para saber mais.
 * @param {{filePath: string;nextFilesToLoad: string[];toImport: string[];content: string;}} initialFileSchema
 */
const replaceStatefulReferencesToJSX = (initialFileSchema) => {
  let content = initialFileSchema.content;
  initialFileSchema.toImport.forEach((filePath) => {
    let importItemContent = fs.readFileSync(filePath, "utf8");
    const importComponentName = helpers.getComponentName(importItemContent);
    const isImportStatefulComponent = hasWidgetPropsCheck(
      removeImports(importItemContent),
    );

    if (initialFileSchema.filePath.includes("donorOptions.tsx")) {
      console.log(
        "MAFUBAAAA: \n",
        importComponentName,
        isImportStatefulComponent,
      );
      console.log("\n");
    }

    if (isImportStatefulComponent) {
      // Transforma a referencia do componente stateful em JSX
      content = transformComponentReferenceToJSX(content, importComponentName);
    }
  });

  // Update file content
  initialFileSchema.content = content;

  return initialFileSchema;
};

/**
 * To be like:
 *
 * ```ts
 * [
 *    {
 *      filePath: "file/path/ModuleFile.tsx",
 *      toImport: ["path/moduleFile1.tsx", "path/moduleFile2.tsx"],
 *      content: "<file> <content>..."
 *      nextFilesToLoad: [
 *                        "path/to/import/ModuleFile1.tsx",
 *                        "path/to/import/ModuleFile2.tsx",
 *                     ]
 *    },
 *    {...}
 *    {...}
 * ]
 * ```
 *
 * Then, load files in a unique bundle, filtering to not add duplicated content
 */
let contentOrderer = [];
// Arquivos já processados (evita duplicidade)
let processedFiles = [];
// Lista em ordem de arquivos para carregar / importar
let orderedFilesToImport = [];
// Sinal de erro
let hasError = null;
const processFileSchema = (filePath) => {
  if (hasError) return;

  // Verifica cada arquivo jsx e ts para ver se estão quebrados ou não.
  hasError = checkSyntaxError(filePath);
  hasError = checkForWildcardImports(filePath);

  if (hasError) {
    log.error(hasError);
    return;
  }

  // Se estiver vazio no primeiro processo, adiciona o arquivo de entrada 1
  // (entry point File)
  if (orderedFilesToImport.length === 0) {
    orderedFilesToImport.push(filePath);
  }

  let parentFolder = ".";
  if (!isWindows) {
    // OSX - Linux
    if (filePath) {
      const parentPathParts = filePath.split("/");
      parentPathParts.pop();
      parentFolder = parentPathParts.join("/");
    }
  } else {
    // Windows
    if (filePath) {
      const parentPathParts = filePath.split("\\");
      parentPathParts.pop();
      parentFolder = parentPathParts.join("\\");
    }
  }

  let fileContent = fs.readFileSync(filePath, "utf8");

  // Remove comments from file
  // INFO: Esta sendo usado para remover comentários de arquivos jsx também
  const removeCommentsResult = removeCommentsFromTSX(fileContent, filePath);
  hasError = removeCommentsResult.error;

  if (hasError) {
    log.error(hasError);
    return;
  }

  fileContent = removeCommentsResult.code;
  const fileImportsPath = helpers.getImportsPath(fileContent);

  let currentFileSchema = {
    filePath: filePath,
    // usado para guiar as proximas cargas
    // pode ser deletado no final do processo
    nextFilesToLoad: [],
    toImport: [],
    content: fileContent,
  };
  fileImportsPath.forEach((importPath) => {
    // console.log("Check import Path:", importPath);

    // Windows
    if (isWindows && importPath) {
      importPath = importPath.replaceAll("/", "\\");
    }

    let importedFileContentPath = "";

    // Replace path aliases
    // Check if its has path alias
    if (compilerOptions.hasPathAlias(importPath)) {
      importedFileContentPath = compilerOptions.replacePathAlias(importPath);
    } else {
      // Usa src para inicio ou o caminho do pai do arquivo sendo processado atualmente
      importedFileContentPath = path.join(parentFolder, importPath);
    }

    importedFileContentPath = helpers.getFilePathWithType(
      importedFileContentPath,
    );

    // Registra todos os arquivos que o arquivo atual pede para importar
    if (importedFileContentPath) {
      currentFileSchema.toImport.push(importedFileContentPath);
    }

    // Registra os arquivos necessarios para o arquivo atual (imports)
    // Esse dado da seguimento na busca de dados dos arquivos dos imports
    if (!processedFiles.includes(importedFileContentPath)) {
      if (importedFileContentPath) {
        currentFileSchema.nextFilesToLoad.push(importedFileContentPath);
        orderedFilesToImport.push(importedFileContentPath);
      }

      processedFiles.push(importedFileContentPath);
    }
  });

  // Transform statefull components references to JSX
  currentFileSchema = replaceStatefulReferencesToJSX(currentFileSchema);

  // Push current schema result
  contentOrderer.push(currentFileSchema);

  // Recursividade
  currentFileSchema.nextFilesToLoad.forEach((fileToImport) => {
    // Nao pode ser um recurso do alem-vm
    // if (!fileToImport.includes(ALEM_VM_FOLDER)) {
    processFileSchema(fileToImport);
    // }
  });
};

const loadFilesInfo = (entryFile) => {
  // Reset state
  contentOrderer = [];
  processedFiles = [];
  hasError = null;
  // NOTE: Nao esta sendo usado no momento porque esta usando o contentOrderer.filePath
  // NOTE: contentOrderer.filePath funcionou melhor do que a sequencia do orderedFilesToImport
  orderedFilesToImport = [];

  // Start loading process
  processFileSchema(entryFile);

  // Finaliza o processo do contentOrderer deletando o campo "filesToImport"
  // de todos os filhos, já que agora náo são mais necessarios
  contentOrderer = contentOrderer.map((item) => {
    const newItem = {
      filePath: item.filePath,
      toImport: item.toImport,
      content: item.content,
    };
    delete newItem.filesToImport;
    return newItem;
  });

  // Handle names -> remove const duplicates
  contentOrderer = handleNames(contentOrderer);

  return {
    hasError,
    fileSchemas: contentOrderer,
    // orderedFilesToImport: orderedFilesToImport.reverse(),
    orderedFilesToImport: contentOrderer
      .map((schema) => schema.filePath)
      .reverse(),
  };
};

module.exports = loadFilesInfo;
