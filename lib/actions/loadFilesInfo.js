const path = require("path");
const fs = require("fs");
const _ = require("lodash");
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
const processFileSchema = (filePath, processOnlyThisFile) => {
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

  if (!processOnlyThisFile) {
    // Recursividade
    currentFileSchema.nextFilesToLoad.forEach((fileToImport) => {
      // Nao pode ser um recurso do alem-vm
      // if (!fileToImport.includes(ALEM_VM_FOLDER)) {
      processFileSchema(fileToImport);
      // }
    });
  }
};

/**
 * Gera um esquema com os arquivos sendo importados no projeto a partir de um ponto de entrada
 * @param {*} entryFile
 * @returns
 */
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

  // Registra uma copia (não referencia na mesmo ponto da memória) do esquema inicial inalterada
  const initialFileSchemas = _.cloneDeep(contentOrderer);

  // Handle names -> remove const duplicates
  contentOrderer = handleNames(contentOrderer);

  return {
    hasError,
    initialFileSchemas,
    fileSchemas: contentOrderer,
    orderedFilesToImport: contentOrderer
      .map((schema) => schema.filePath)
      .reverse(),
  };
};

/**
 * Atualiza o esquema de arquivos iniciais alterando somente o arquivo que foi mudado
 * @param {*} changedFilePath
 * @returns
 */
const updateFilesInfo = (changedFilePath, previousInitialFileSchemas) => {
  // Reset state
  contentOrderer = [];
  processedFiles = [];
  hasError = null;
  // NOTE: Nao esta sendo usado no momento porque esta usando o contentOrderer.filePath
  // NOTE: contentOrderer.filePath funcionou melhor do que a sequencia do orderedFilesToImport
  orderedFilesToImport = [];

  // Start loading process
  processFileSchema(changedFilePath, true);

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

  // Busca a referencia deste arquivo no esquema de arquivos iniciais na memória
  // e altera para os novos valores
  const changedFilePreviousSchema = previousInitialFileSchemas.find(
    (fileSchema) => fileSchema.filePath === changedFilePath,
  );
  const changedFileIndex = previousInitialFileSchemas.indexOf(
    changedFilePreviousSchema,
  );

  // Atualiza os dados do arquivo na lista de esquemas inicial já existente
  const previousInitialFileSchemasCopy = _.cloneDeep(
    previousInitialFileSchemas,
  );
  previousInitialFileSchemasCopy[changedFileIndex] = contentOrderer[0];

  // Handle names -> remove const duplicates
  // INFO: É necessário fazer copias para não referenciar ao mesmo ponto de memória e causar um
  // erro generalizado
  let updatedFileSchemas = _.cloneDeep(previousInitialFileSchemasCopy);
  updatedFileSchemas = handleNames(updatedFileSchemas);

  return {
    hasError,
    initialFileSchemas: previousInitialFileSchemasCopy,
    fileSchemas: updatedFileSchemas,
    orderedFilesToImport: updatedFileSchemas
      .map((schema) => schema.filePath)
      .reverse(),
  };
};

module.exports = {
  loadFilesInfo,
  updateFilesInfo,
};
