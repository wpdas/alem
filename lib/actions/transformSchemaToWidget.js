const { getImportStatements, getFileImportsElements } = require("../helpers");
const { process_file_content } = require("../parse");
const { ALL_BLANK_LINES, SPACES } = require("../regexp");
const { log } = require("../utils");
/**
 * @param {string} content
 */
const getFirstConstName = (content) => {
  const regex = /const\s+(\w+)/;
  const foundItem = content.match(regex);
  if (foundItem) {
    return foundItem[1];
  }
  return null;
};

/**
 * @param {string} content
 */
const getFirstLetName = (content) => {
  const regex = /let\s+(\w+)/;
  const foundItem = content.match(regex);
  if (foundItem) {
    return foundItem[1];
  }
  return null;
};

/**
 * @param {string} content
 */
const getFirstVarName = (content) => {
  const regex = /var\s+(\w+)/;
  const foundItem = content.match(regex);
  if (foundItem) {
    return foundItem[1];
  }
  return null;
};

/**
 * @param {string} content
 */
const getFirstFunctionName = (content) => {
  const regex = /function\s+(\w+)/;
  const foundItem = content.match(regex);
  if (foundItem) {
    return foundItem[1];
  }
  return null;
};

/**
 * @param {string} content
 */
const getComponentParams = (content) => {
  const firstLineRegex = /^(.*)$/m;
  const regex = /\((.*)\)/;
  const firstLineFound = content.match(firstLineRegex);

  if (firstLineFound) {
    const foundItems = firstLineFound[1].match(regex);
    if (foundItems) {
      return foundItems[1]
        .replaceAll(SPACES, "")
        .split(",")
        .filter((item) => item.length > 0);
    }
  }
  return [];
};

/**
 * @param {string} content
 */
const getFirstLineContent = (content) => {
  const firstLineRegex = /^(.*)$/m;
  const firstLineFound = content.match(firstLineRegex);
  return firstLineFound[1] || null;
};

/**
 * @param {string} content
 */
const removeLastLine = (content) => {
  // Remove last }
  const indexes1 = [];
  const regex1 = /}/g;
  let match1;
  while ((match1 = regex1.exec(content)) !== null) {
    indexes1.push(match1.index);
  }
  const last_index1 = indexes1.at(-1);
  content = content.slice(0, last_index1);

  // Remove last ;
  const indexes2 = [];
  const regex2 = /}/g;
  let match2;
  while ((match2 = regex2.exec(content)) !== null) {
    indexes2.push(match2.index);
  }
  const last_index2 = indexes1.at(-1);
  content = content.slice(0, last_index2);

  return content;
};

/**
 * Escapa os ` inclusos nos arquivos
 * @param {string} content
 */
const scapeBacktick = (content) => content.replace(/`/g, "\\`");

/**
 * @param {{filePath: string, toImport: string[], content: string}} fileSchema
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const processSchema = (fileSchema) => {
  // ITEM 0
  const isJsxFile =
    fileSchema.filePath.endsWith(".jsx") ||
    fileSchema.filePath.endsWith(".tsx");

  // ITEM 1
  const componentImports = getFileImportsElements(fileSchema.content);
  // console.log("ITEM 1", componentImports);

  // ITEM 2
  const transpileTypescript =
    fileSchema.filePath.endsWith(".ts") || fileSchema.filePath.endsWith(".tsx");

  let jsContent = process_file_content(
    fileSchema.content,
    transpileTypescript,
  ).replaceAll(ALL_BLANK_LINES, ""); // remove linhas em branco

  // Se nao for um JSX, processa o arquivo de forma normal
  // apenas pra gerar um js
  if (!isJsxFile) {
    // FINAL: para arquivos nao JSX
    fileSchema.finalFileBundle = jsContent;
    return fileSchema;
  }

  // Se for JSX, inicia o processo de transformar num componente que retorna Widget

  // ITEM 3.1
  const componentName =
    getFirstConstName(jsContent) ||
    getFirstLetName(jsContent) ||
    getFirstVarName(jsContent) ||
    getFirstFunctionName(jsContent);

  // Se nao tiver função do componente, dispara erro
  if (!componentName) {
    log.error(`Error: ${fileSchema.filePath}: Component function not found!`);
  }

  // ITEM 3.2
  const componentParams = getComponentParams(jsContent);

  // ITEM 4
  let methodInitialContent = getFirstLineContent(jsContent);

  // SUPORT FOR IMMEDIATE FUNCTIONS
  // Change immediate function to normal function
  if (methodInitialContent.endsWith("(")) {
    const chars = methodInitialContent.split("");
    chars[chars.length - 1] = "{";
    methodInitialContent = chars.join("");
  }
  if (!methodInitialContent) {
    log.error(
      `Error: ${fileSchema.filePath}: Component function/name not found!`,
    );
  }

  // ITEM 4 (remover primeira linha)
  jsContent = jsContent
    .replaceAll(methodInitialContent, "")
    .replaceAll(ALL_BLANK_LINES, "");

  // ITEM 5 (remover ultima linha)
  jsContent = removeLastLine(jsContent);

  // ITEM 6
  // ATENCAO: esta copiando tipos de props tbm do typescript
  jsContent = `
  const { ${[...componentImports, ...componentParams]} } = props;
  ${jsContent}
  `;

  // ITEM 7
  jsContent = `const code = \`${scapeBacktick(jsContent)}\``;

  // ITEM 8 & ITEM 9 & ITEM 10
  jsContent = `
  ${methodInitialContent}
  ${jsContent}
  return <Widget code={code} props={{${[...componentImports, ...componentParams]}}} />
  };
  `;

  // FINAL
  // Injeta o conteúdo final de widget no arquivo
  fileSchema.finalFileBundle = jsContent;

  // console.log("Component Name:", componentName);
  // console.log("Component Params:", componentParams);
  // console.log("Component First line:", methodInitialContent);
  // console.log(jsContent);
  // console.log("\n\n");

  return fileSchema;
};

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const transformSchemaToWidget = (fileSchemas) => {
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = processSchema(fileSchema);
  });

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
