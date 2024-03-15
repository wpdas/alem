const fs = require("fs");
const {
  getFileImportsElements,
  getFileComponents,
  getComponentName,
  getComponentParams,
  removeLineFromText,
  removeLastLineFromText,
  extractHtmlElements,
  getHtmlElementProps,
  getHtmlElementName,
  getImportedElementFileSource,
  getFilePathWithType,
  getFilePathBasedOnParentAndChildFilePath,
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
  // const isAlemToolsFolder = fileSchema.filePath.includes("lib/alem-vm/");

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

  // ITEM 3.2

  // remove qualquer propriedade "props", ja que vai ser inclusa automaticamente
  componentImports = componentImports.filter((item) => item !== "props");

  // Only JSX files has the "componentParamsItems" props
  if (isJsxFile) {
    const componentParams = getComponentParams(jsContent);
    fileSchema.componentParamsItems = componentParams.filter(
      (item) => item !== "props",
    );
  }

  // Pega e registra o diretório do arquivo de cada dependencia/imported item
  const componentImportItems = {};
  componentImports.forEach((importedItem) => {
    let importedItemFileSource = getImportedElementFileSource(
      fileSchema.content,
      importedItem,
    );

    if (!importedItemFileSource) {
      log.error("File directory for the imported item not found!");
      process.exit(1);
    }

    importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
      fileSchema.filePath,
      importedItemFileSource,
    );

    componentImportItems[importedItem] = importedItemFileSource;
  });
  fileSchema.componentImportItems = componentImportItems;

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

  if (isJsxFile) {
    fileSchema.componentComponentItems = getFileComponents(fileSchema.content);
  } else {
    fileSchema.componentComponentItems = [];
  }

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

  // Computa os items que devem ser injetados no corpo do Widget. Esses são os arquivos (conteúdo deles) que devem
  // ser copiados e colados dentro da estrutura do Widget. Esses arquivos normalmente são os que tem extensao .ts ou .js
  // e não são processados como componentes.

  // console.log("CHEEEEEEEK:", componentImportItems);

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
 * Cria a estrutura dos elementos htmls e suas propriedades e coloca no schema
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const populateHtmlElementsProps = (fileSchema) => {
  const htmlElements = extractHtmlElements(fileSchema.finalFileBundle);
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);

  let htmlElementProps = {};
  htmlElements.forEach((elementHtml) => {
    const elementName = getHtmlElementName(elementHtml);
    const elementProps = getHtmlElementProps(elementHtml);

    if (elementName) {
      htmlElementProps[elementName] = {
        name: elementName,
        props: elementProps,
      };
    }
  });

  // console.log("HTML Elements Props", htmlElementProps);
  // console.log("\n\n");

  // Seta os valores
  fileSchema.htmlElementsProps = htmlElementProps;

  // console.log("Updated Schema", fileSchema);
  // console.log("\n\n");

  return fileSchema;
};

/**
 * Varre todos os componentes e verifica se são Widgets, se for o caso, troca os componentes por <Widget code='' props />
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const swapComponentsForWidgets = (fileSchemas, fileSchema) => {
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);
  // console.log("\n\n");
  const pastedFiles = [];
  let fileBundle = fileSchema.finalFileBundle;

  // Checa se o item faz parte de componentes
  console.log("\n\n");
  console.log("ARQUIVO =:", fileSchema.filePath);
  console.log(fileSchema);
  Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
    // Se for item não widget, inclui no topo do bundle do arquivo

    console.log(
      "PROCESSANDO AGORA:",
      "ARQUIVO:",
      fileSchema.filePath,
      "IMPORT ITEM:",
      importItem,
    );

    // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
    const importItemFilePath = fileSchema.componentImportItems[importItem];
    // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
    if (importItemFilePath && !pastedFiles.includes(importItemFilePath)) {
      // Is import item comming from JSX | TSX file?
      const isImportItemCommingFromJsxFile =
        importItemFilePath.endsWith("tsx") ||
        importItemFilePath.endsWith("jsx");

      console.log("É um componente/Widget?", isImportItemCommingFromJsxFile);
      // NAO WIDGETS: tem o conteúdo de seu arquivo copiado e colado no corpo do arquivo sendo processado atual
      if (!isImportItemCommingFromJsxFile) {
        // Load file content (copy and paste file content where this import item is comming from)
        // Files without source are the ones that not live in the src directory
        const importItemFileSource =
          fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

        if (importItemFileSource) {
          console.log(importItemFileSource);
          // Le os dados do arquivo já processado (usando o fileSchema dele)
          const importItemFileContent = fileSchemas.find(
            (importFileSchema) =>
              importFileSchema.filePath === importItemFileSource,
          );
          console.log(
            ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
            fileSchema.filePath,
            importItemFileContent,
          );
          // const importItemFileContent = fs.readFileSync(
          //   importItemFileSource,
          //   "utf8",
          // );
          console.log(
            `======= Import Item File Source =========> ${importItem} => ${importItemFileSource} => ${importItemFileContent.finalFileBundle}`,
          );
          // console.log(importItemFileContent);
          console.log("\n\n");
          // TODO: Fazer com que todos os arquivos encapsulem o conteúdo de suas dependencias em si mesmo usando o "finalFileBundle"
          fileBundle = `
          ${importItemFileContent.finalFileBundle}
  
          ${fileBundle}
          `;

          fileSchema.finalFileBundle = fileBundle;
          console.log("ESCHEMAAAAAAA =========", fileSchema.finalFileBundle);
        }
      } else {
        // WIDGET FILES: Os componentes identificados como widgets são trocados por <Widget code=`<widget_code>` props={} />
        // o code do Widget sendo usado também é importado
        // TODO: pensar nisso, tem alguma forma de usar uma referencia desse code? Vindo do State global talvez?.
        // TODO: copiar e colar o codigo dentro de cada arquivo que depende dele pode deixar o bundle muito grande.
      }
    }
  });

  return fileSchema;
};

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]}
 */
const transformSchemaToWidget = (fileSchemas) => {
  // Gera o primeiro finalFileBundle e widgetName(para Widgets somente), parametros e imports
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = processSchema(fileSchema);
  });

  // Adiciona os dados de cada elemento HTML no schema de cada arquivo
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que tenham conteúdo Widget apenas
    if (fileSchema.widgetName) {
      fileSchemas[fileSchemaIndex] = populateHtmlElementsProps(fileSchema);
    }
  });

  // Faz a troca de <Componentes> dentro de cada arquivo por <Widget> se um Widget for detectado como dependencia
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que tenham conteúdo Widget apenas
    if (fileSchema.widgetName) {
      fileSchemas[fileSchemaIndex] = swapComponentsForWidgets(
        fileSchemas,
        fileSchema,
      );
      //
      // fileSchemas[fileSchemaIndex] = populateHtmlElementsProps(fileSchema);
      // console.log(fileSchema.htmlElementsProps);
    }
  });

  console.log("File Schemas:", fileSchemas);
  // console.log("File Schemas:", fileSchemas.widgetName, fileSchemas.componentImportItems);

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
