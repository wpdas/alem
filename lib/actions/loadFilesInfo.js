const path = require("path");
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
const filesContentCache = require("../config/filesContentCache");
const replaceRegexWithReferences = require("../parsers/regex-parser/convertRegexToStringLiteral");
const regexObjects = require("../parsers/regex-parser/regexObjects");
const prepareAlemDependencies = require("./prepareAlemDependencies");
// const processImportsToBase64 = require("../parsers/processImportsToBase64");
// const extractTopLevelDeclarations = require("../parsers/extractTopLevelDeclarations");
/**
 * Transform statefull components references to JSX (this applies for stateful and stateless components)
 * Troca referencias de stateful components para JSX. Accesse o arquivo "transformComponentReferenceToJSX" para saber mais.
 * @param {{filePath: string;nextFilesToLoad: string[];toImport: string[];content: string;}} initialFileSchema
 */
const replaceStatefulReferencesToJSX = (initialFileSchema) => {
  let content = initialFileSchema.content;
  initialFileSchema.toImport.forEach((filePath) => {
    // let importItemContent = fs.readFileSync(filePath, "utf8");
    let importItemContent = filesContentCache.getFileContent(filePath);
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

  if (hasError) {
    log.error(hasError);
    return;
  }

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

  let fileContent = filesContentCache.getFileContent(filePath);

  // Captura as expressoes regulares, salvam ela em um objeto para ser usado
  // posteriormente no compiler.js através do "injectFoundRegExps.js"
  const replaceRegexResult = replaceRegexWithReferences(fileContent);
  if (replaceRegexResult.hasExpressions) {
    fileContent = replaceRegexResult.code;
    regexObjects.addExpressions(replaceRegexResult.expressions);
  }

  // Remove comments from file
  // INFO: Esta sendo usado para remover comentários de arquivos jsx também
  const removeCommentsResult = removeCommentsFromTSX(fileContent, filePath);
  hasError = removeCommentsResult.error;

  if (hasError) {
    log.error(hasError);
    return;
  }

  fileContent = removeCommentsResult.code;

  // Processa as dependencias de Além
  const alemStuff = prepareAlemDependencies(fileContent);
  fileContent = alemStuff.updatedFileContent;

  // INFO: Caminho dos imports
  const fileImportsPath = helpers.getImportsPath(fileContent);

  let currentFileSchema = {
    filePath: filePath,
    // usado para guiar as proximas cargas
    // pode ser deletado no final do processo
    nextFilesToLoad: [],
    toImport: [],
    content: fileContent,
    isModule: false,
    moduleProps: {},
    base64Images: [],
  };

  fileImportsPath.forEach((importPath) => {
    // console.log("Check import Path:", importPath);

    // Windows
    if (isWindows && importPath) {
      importPath = importPath.replaceAll("/", "\\").replaceAll("\\\\", "\\");
    }

    let importedFileContentPath = importPath;

    // Replace path aliases
    // Check if its has path alias
    if (compilerOptions.hasPathAlias(importPath)) {
      importedFileContentPath = compilerOptions.replacePathAlias(importPath);

      // INFO: Se incluir um caminho relativo de um recurso Além, não precisa relacionar com o componente pai
      // já que o diretório está pronto para acessar o arquivo
    } else if (
      !importPath.includes("node_modules/alem") && // unix
      !importPath.includes("node_modules\\alem") // win
    ) {
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

  const finalize = () => {
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

  // Note: Chamando diretamente pois o processo de transformar imagem para base64
  // ainda nao esta completo
  finalize();

  /**
   * TODO: Terminar a implantação. No momento, está usando async e como o metodo "processFileSchema"
   * é sync, ele continua antes de acabar o processo abaixo async. Deve-se transformar o processFilesSchema
   * em async e espelhar isso em todos os recursos que o usa.
   *
   * "processImportsToBase64" abaixo retorna uma lista de
   * {imageKey: "nome do import da imagem", imageBase64Content: "conteúdo base64 da imagem"}
   *
   * Esses dados devem ser usados posteriormente:
   * 1 - Inserir um const no topo do arquivo (para stateful) ou
   * 1.1 - Inserir um const na primeira linha após o início da função (para stateless)
   * 2 - esse const inserido tem o nome da "imageKey" e seu valor é o "imageBase64Content"
   *
   * Configuraçao (alem.config.json):
   * options: {
   *    base64Images: {
   *      enabled: false,
   *      quality: 80, // aqui é fator de no máximo 100
   *    }
   * }
   */

  // processImportsToBase64(fileContent, filePath, 80)
  //   .then((data) => {
  //     if (data.length > 0) {
  //       currentFileSchema.base64Images = data;
  //     }
  //     finalize();
  //   })
  //   .catch(finalize);
};

/**
 * Gera um esquema com os arquivos sendo importados no projeto a partir de um ponto de entrada
 * @param {*} entryFile
 * @returns
 */
const loadFilesInfo = (entryFile, processOnlyThisFile) => {
  // Reset state
  contentOrderer = [];
  processedFiles = [];
  hasError = null;
  // NOTE: Nao esta sendo usado no momento porque esta usando o contentOrderer.filePath
  // NOTE: contentOrderer.filePath funcionou melhor do que a sequencia do orderedFilesToImport
  orderedFilesToImport = [];

  // Start loading process
  processFileSchema(entryFile, processOnlyThisFile);

  // Finaliza o processo do contentOrderer deletando o campo "filesToImport"
  // de todos os filhos, já que agora náo são mais necessarios
  contentOrderer = contentOrderer.map((item) => {
    const newItem = {
      filePath: item.filePath,
      toImport: item.toImport,
      content: item.content,
      // isModule: item.isModule,
      // moduleProps: item.moduleProps,
    };
    delete newItem.filesToImport;
    return newItem;
  });

  // Registra uma copia (não referencia na mesmo ponto da memória) do esquema inicial inalterada
  const initialFileSchemas = _.cloneDeep(contentOrderer);

  // Handle names -> remove const duplicates
  contentOrderer = handleNames.handleNames(contentOrderer); // INFO: parte que esta consumindo bastante recurso

  return {
    hasError,
    initialFileSchemas,
    fileSchemas: contentOrderer,
    orderedFilesToImport: contentOrderer
      .map((schema) => schema.filePath)
      .reverse(),
  };
};

module.exports = loadFilesInfo;
