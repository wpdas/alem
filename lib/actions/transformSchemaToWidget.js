const { getFileImportsElements } = require("../helpers");
const { process_file_content } = require("../parse");
const { ALL_BLANK_LINES, SPECIAL_CHARACTERS_AND_SPACES } = require("../regexp");
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
        .split(",")
        .filter((item) => item.length > 0)
        .map((item) => item.replaceAll(SPECIAL_CHARACTERS_AND_SPACES, ""));
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

const PROHIBITED_METHODS = ["useState", "useEffect", "state"];
/**
 * Remove prohibited methods
 * @param {string[]} importItems
 * @returns
 */
const removeProhibitedMethods = (importItems) =>
  importItems.filter((item) => {
    return !PROHIBITED_METHODS.includes(item);
  });

/**
 * @param {{filePath: string, toImport: string[], content: string}} fileSchema
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const processSchema = (fileSchema) => {
  // ITEM 0
  const isJsxFile =
    fileSchema.filePath.endsWith(".jsx") ||
    fileSchema.filePath.endsWith(".tsx");

  // So transforma em Widget os componentes na pasta widget
  const isInWidgetFolder = fileSchema.filePath.includes("/widgets/");
  console.log("FOLDERRR", fileSchema.filePath, isInWidgetFolder);

  // ITEM 1
  let componentImports = getFileImportsElements(fileSchema.content);
  componentImports = removeProhibitedMethods(componentImports);

  // console.log("ITEM 1", componentImports);

  // ITEM 2
  const transpileTypescript =
    fileSchema.filePath.endsWith(".ts") || fileSchema.filePath.endsWith(".tsx");

  let jsContent = process_file_content(
    fileSchema.content,
    transpileTypescript,
  ).replaceAll(ALL_BLANK_LINES, ""); // remove linhas em branco

  // Se nao for um JSX, processa o arquivo de forma normal &
  // Se nao estiver na pasta /widget
  // apenas pra gerar um js
  if (!isJsxFile || !isInWidgetFolder) {
    // FINAL: para arquivos nao JSX
    fileSchema.finalFileBundle = jsContent;
    return fileSchema;
  }

  // SUPPORT FOR IMMEDIATE FUNCTION RETURNING ELEMENT - PART 1
  // Se a primeira linha do arquivo contiver elementos html, entao nao precisa processar
  // já que se trata de um arquivo stateless simples
  // ex: const ShareIcon = () => <span className="material-symbols-outlined">share</span>;
  if (
    getFirstLineContent(jsContent).includes("<") ||
    getFirstLineContent(jsContent).endsWith("(")
  ) {
    // FINAL: para arquivos JSX stateless simples no formato do ex.
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
  console.log("ULTIMAMENTE ADNDANDO SOZINHO:", componentParams);

  // ITEM 4
  let methodInitialContent = getFirstLineContent(jsContent);

  // SUPORT FOR IMMEDIATE FUNCTIONS
  // Change immediate function to normal function
  // if (methodInitialContent.endsWith("(")) {
  //   console.log("AKAJFKSDF:KDJK:FJDKLFJDK:FJKDJF:DJFKLDJ:FKDJFLKDJFLKD");
  //   const chars = methodInitialContent.split("");
  //   chars[chars.length - 1] = "{";
  //   methodInitialContent = chars.join("");
  // }

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
  // Coloca o jsContent escapando as caracteres ` que sao usadas lá dentro
  // Isso evita erro na construcao do const code que também usa essa caractere
  jsContent = `const code = \`${scapeBacktick(jsContent)}\``;

  // ITEM 8 & ITEM 9 & ITEM 10
  jsContent = `
  ${methodInitialContent}
  ${jsContent}
  return <Widget code={code} props={{${[...componentImports, ...componentParams]}}} />
  };
  `;

  if (fileSchema.filePath.includes("pages/index.ts")) {
    console.log(fileSchema.filePath);
    console.log(jsContent);
    console.log(componentImports);
    console.log("INITI:", methodInitialContent);
    console.log("PAREMS:", componentParams);
    console.log("NOME:", componentName);
    console.log("\n\n");
  }

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
