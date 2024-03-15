const {
  getFileImportsElements,
  getFileComponents,
  getComponentName,
  getComponentParams,
  removeLineFromText,
  removeLastLineFromText,
} = require("../helpers");
const { process_file_content, removeImports } = require("../parse");
const {
  ALL_BLANK_LINES,
  SPECIAL_CHARACTERS_AND_SPACES,
  GET_SECOND_WORD,
  FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
  LINE_BREAKS,
} = require("../regexp");
const { log } = require("../utils");
const addDependenciesToComponentMethod = require("./addDependenciesToComponentMethod");
const hasWidgetPropsCheck = require("./hasWidgetPropsCheck");
const removeComponentMethodProps = require("./removeComponentMethodProps");

/**
 * @param {string} content
 */
const getFirstLineContent = (content) => {
  const firstLineRegex = /^(.*)$/m;
  const firstLineFound = content.match(firstLineRegex);
  // console.log("MAAATCH", firstLineFound);
  return firstLineFound[1] || null;
};

/**
 * Escapa os ` inclusos nos arquivos
 * @param {string} content
 */
const scapeBacktick = (content) => content.replace(/`/g, "\\`");

const PROHIBITED_METHODS = [
  "styled",
  "useState",
  "useEffect",
  "state",
  "State",
  "VM",
  "Tooltip",
  "TypeAhead",
  "InfiniteScroll",
  "OverlayTrigger",
  "Files",
  "IpfsImageUpload",
  "Social",
  "Near",
  "clipboard",
  "Storage",
  "useCache",
  "asyncFetch",
  "fetch",
  "Markdown",
  "Widget",
  "context",
  "props",
];
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
 */
const prepareWidgetsFiles = (fileSchema) => {
  // Para identificar um <Componente> temos que fazer isso:
  // 1 - Cada arquivo é um componente. Se tiver mais de um componente dentro, quebra
  // TODO: melhorar isso depois para detectar componentes por funcao ou algo assim
  // 2 - Buscar o nome do componente dentro do arquivo (ja tem uma funcao para pegar o nome, ver "removeComponentMethodProps")
  // 3 - Guardar o nome do componente no Schema do Arquivo
  // 4 - Guardar o "code" (mais abaixo tem) do arquivo no esquema dele
  // 5 - Gerar um novo "code" para o code já existente substituindo os <Componente> por <Widget code={Componente.code} props={{...props}} />
  // console.log("FILE SCHEMA", fileSchema);
};

/**
 * @param {{filePath: string, toImport: string[], content: string}} fileSchema
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const processSchema = (fileSchema) => {
  // Prepara o schema do <Widget /> e dos arquivos não Widget (ts, js)

  // ITEM 0
  const isJsxFile =
    fileSchema.filePath.endsWith(".jsx") ||
    fileSchema.filePath.endsWith(".tsx");

  // So transforma em Widget os componentes quem tem propriedades de Widget
  // useState, useEffect, State.init
  // const hasWidgetProps = hasWidgetPropsCheck(fileSchema.content);
  // if (hasWidgetProps) {
  //   console.log("HAS WIDGET PROPS", fileSchema.filePath);
  // }
  // const hasWidgetProps = true;

  // Aceita arquivos da pasta /tools/ do alem
  const isAlemToolsFolder = fileSchema.filePath.includes("lib/alem-vm/");

  // ITEM 2
  const transpileTypescript =
    fileSchema.filePath.endsWith(".ts") || fileSchema.filePath.endsWith(".tsx");

  let jsContent = process_file_content(
    fileSchema.content,
    transpileTypescript,
    false,
  );

  // ITEM 1
  let componentImports = getFileImportsElements(jsContent);
  componentImports = removeProhibitedMethods(componentImports);

  if (fileSchema.filePath.includes("getLinksByCategory")) {
    console.log("ITEM 1", componentImports);
  }

  // Remove imports (isso foi inibido no process_file_content no terceiro parametro)
  jsContent = removeImports(jsContent).replaceAll(ALL_BLANK_LINES, ""); // remove linhas em branco;

  // Se nao for um JSX, processa o arquivo de forma normal &
  // Se nao estiver na pasta /widget
  // apenas pra gerar um js
  // if (!isJsxFile || (!hasWidgetProps && !isAlemToolsFolder)) {
  if (!isJsxFile) {
    // FINAL: para arquivos nao JSX
    fileSchema.finalFileBundle = jsContent;
    return fileSchema;
  }

  console.log(fileSchema.filePath);
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
  const componentName = getComponentName(jsContent);
  fileSchema.widgetName = componentName;

  // Se nao tiver função do componente, dispara erro
  if (!componentName) {
    log.error(`Error: ${fileSchema.filePath}: Component function not found!`);
  }

  // ITEM 3.2
  const componentParams = getComponentParams(jsContent);
  // console.log("ULTIMAMENTE ADNDANDO SOZINHO:", jsContent, componentParams);

  // Remove o conteúdo do inicio da funcao para evitar quebra de linha
  jsContent = jsContent.replace(FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS, "()");
  // console.log("FILE SCHEMA - BEFORE", jsContent);

  // ITEM 4
  // let methodInitialContent = getFirstLineContent(jsContent);

  // SUPORT FOR IMMEDIATE FUNCTIONS
  // Change immediate function to normal function
  // if (methodInitialContent.endsWith("(")) {
  //   console.log("AKAJFKSDF:KDJK:FJDKLFJDK:FJKDJF:DJFKLDJ:FKDJFLKDJFLKD");
  //   const chars = methodInitialContent.split("");
  //   chars[chars.length - 1] = "{";
  //   methodInitialContent = chars.join("");
  // }

  // if (!methodInitialContent) {
  //   log.error(
  //     `Error: ${fileSchema.filePath}: Component function/name not found!`,
  //   );
  // }

  // ITEM 4 (remover primeira linha)
  jsContent = removeLineFromText(jsContent, 1);
  // jsContent = jsContent
  //   .replaceAll(methodInitialContent, "")
  //   .replaceAll(ALL_BLANK_LINES, "");

  // ITEM 5 (remover ultima linha)
  jsContent = removeLastLineFromText(jsContent);

  // console.log("FILE SCHEMA - AFTER", jsContent);

  // Todo: Transform components generated by .jsx / .tsx into <Widget code={code} .../>
  // Note: use "getFileComponents" for this

  // Adiciona também um verificador de dependencias
  // se as dependencias (imports - components only) nao estiverem prontas, nao renderiza o componente
  // NOTE: isso é porque alguns componentes (imports - components only) nao estam prontos no momento do render
  // ai aparece um erro rapido de "Unknown element: <nome do elemento>"
  // NOTE: Somente para arquivos do projeto e arquivos que foram transformados
  // em Widgets (nao incluir os da lib como tools)
  // let componentsElementsCheck = "";
  // // if (!isAlemToolsFolder && hasWidgetProps) {
  // if (!isAlemToolsFolder) {
  //   // Checa se tem componentes a serem importados, se tiver
  //   // prossegue
  //   const components = getFileComponents(fileSchema.content);
  //   if (components.length > 0) {
  //     componentsElementsCheck = "if (";
  //     components.forEach((element, elementIndex) => {
  //       componentsElementsCheck += `!${element}`;
  //       if (components.length - 1 === elementIndex) {
  //         componentsElementsCheck += `) return <></>;`;
  //       } else {
  //         componentsElementsCheck += " || ";
  //       }
  //     });
  //   }
  // }
  // TODO: tenho que pegar essa parte acima agora e colocar no final de tudo, retirando do "componentsElementsCheck"
  // TODO: os elementos que são <Widgets> (fileSchema.widgetName)
  // TODO: ou importar (copiar e colar) o conteúdo inteiro dos arquivos .ts .js importados dentro dos Widget.code

  fileSchema.componentComponentItems = getFileComponents(fileSchema.content);

  // fileSchema.widgetCode = jsContent;
  // console.log("FILE SCHEMA", fileSchema);

  // ITEM 6
  // ATENCAO: esta copiando tipos de props tbm do typescript
  // jsContent = `
  // const { ${[...componentImports, ...componentParams]} } = props;
  // ${componentsElementsCheck}
  // ${jsContent}
  // `;

  // ITEM 7
  // Coloca o jsContent escapando as caracteres ` que sao usadas lá dentro
  // Isso evita erro na construcao do const code que também usa essa caractere
  // jsContent = `const code = \`${scapeBacktick(jsContent)}\``;

  // console.log("<=== CHECK imports ===>", componentImports);
  // console.log("<=== CHECK params ===>", componentParams);

  // console.log("CHECK 1:", methodInitialContent);

  // NOTE: To removendo pois todos os metodos serao usados apenas para invocar
  // um Widget com suas propriedades já prontas
  // if (!isAlemToolsFolder) {
  //   // Insere as dependencias no metodo inicial do componente
  //   methodInitialContent = addDependenciesToComponentMethod(
  //     methodInitialContent,
  //     [...componentImports, ...componentParams],
  //   );
  // }

  // methodInitialContent = removeComponentMethodProps(methodInitialContent);

  // TODO: Vai precisar desta parte abaixo também pra gerar (inclusive o componentParams pra fazer a injecao dos Widgets)
  // let importsAndParams = [...componentImports, ...componentParams];
  // importsAndParams = importsAndParams.filter((item) => item !== "props"); // remove qualquer propriedade "props", ja que vai ser inclusa automaticamente

  // remove qualquer propriedade "props", ja que vai ser inclusa automaticamente
  fileSchema.componentImportItems = componentImports.filter(
    (item) => item !== "props",
  );
  fileSchema.componentParamsItems = componentParams.filter(
    (item) => item !== "props",
  );

  // console.log("CHEEEEEEEK:", importsAndParams, importsAndParams.length);

  // // ITEM 8 & ITEM 9 & ITEM 10
  // jsContent = `
  // ${jsContent}
  // return <Widget code={code} ${importsAndParams.length > 0 ? `props={{...{${importsAndParams}} ${importsAndParams.length > 0 ? ", ...props" : ""}}}` : "props={{...props}}"} />
  // };
  // `;

  // if (fileSchema.filePath.includes("About/About.tsx")) {
  //   console.log(fileSchema.filePath);
  //   // console.log(jsContent);
  //   console.log(componentImports);
  //   console.log("INITI:", methodInitialContent);
  //   console.log("PAREMS:", componentParams);
  //   console.log("NOME:", componentName);
  //   console.log("\n\n");
  // }

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
 * Faz a troca de <Componentes> dentro de cada arquivo por <Widget> se um Widget for detectado como dependencia
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: []}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: []}} fileSchema
 */
const applyWidgetToFiles = (fileSchemas, fileSchema) => {};

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: []}[]}
 */
const transformSchemaToWidget = (fileSchemas) => {
  // Gera o primeiro finalFileBundle e widgetName(para Widgets somente), parametros e imports
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = processSchema(fileSchema);
  });

  // Faz a troca de <Componentes> dentro de cada arquivo por <Widget> se um Widget for detectado como dependencia
  // fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
  //   fileSchemas[fileSchemaIndex] = applyWidgetToFiles(fileSchemas, fileSchema);
  // });

  console.log("File Schemas:", fileSchemas);

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
