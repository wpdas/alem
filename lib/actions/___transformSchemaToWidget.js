const { parse } = require("node-html-parser");
const fs = require("fs");
const path = require("path");
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
  getFilePathBasedOnParentAndChildFilePath,
  // replaceWordAfterTheLessThanSign,
  convertObjectToArray,
  getHtmlElementChildren,
  extractHtmlCompleteElements,
  scapeBacktick,
  hasHtmlElements,
} = require("../helpers");
const { process_file_content, removeImports } = require("../parse");
const {
  ALL_BLANK_LINES,
  FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
  MORE_THAN_ONE_SPACE,
  LINE_BREAKS,
  HTML_ELEMENT,
  HTML_ELEMENT_ONLY,
} = require("../regexp");
const { log } = require("../utils");
const getAlemComponentsPath = require("../config/getAlemComponentsPath");
const getAlemComponentNameByFilePath = require("../config/getAlemComponentNameByFilePath");
const PROHIBITED_METHODS = require("../config/prohibitedMethods");
const hasWidgetPropsCheck = require("./hasWidgetPropsCheck");

/**
 * @param {string} content
 */
const getFirstLineContent = (content) => {
  const firstLineRegex = /^(.*)$/m;
  const firstLineFound = content.match(firstLineRegex);
  return firstLineFound[1] || null;
};

/**
 * Remove prohibited methods
 *
 * Métodos/propriedades que já existem em cada contexto de um Widget não deve ser passado de um Widget para outro.
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
 * Processa o bundle final deste arquivo somente.
 *
 * - Aqui ainda não é injetado as dependencias de Widget, onde NomeComponente vira <Widget code={...NomeComponente} props={...} />
 * - Aqui ainda não é injetado as dependencias não widgets de arquivos .ts or .js
 * - Aqui são setados os: componentParamsItems, componentImportItems, finalFileBundle (atualizado), widgetName (se for um arquivo .tsx ou .jsx)
 * componentComponentItems (se for um arquivo .tsx ou .jsx)
 * - Tudo que isso faz é entregar um bundle final onde tem algo parecido com isso:
 *
 * Recebe isso:
 *
 * import Anything from './anywhere'
 * const App ({age, name}) => {
 *  const [foo, setFoo] = useState(2)
 *  return (<>{age, name}</>)
 * }
 *
 * E retorna isso:
 *
 * const { age, name } = props;
 * return (<>{age, name}</>)
 *
 *
 * @param {{filePath: string, toImport: string[], content: string}} fileSchema
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const processSchema = (fileSchema) => {
  // Prepara o schema do <Widget /> e dos arquivos não Widget (ts, js)

  // ITEM 0
  const isJsxFile =
    fileSchema.filePath.endsWith(".jsx") ||
    fileSchema.filePath.endsWith(".tsx");

  //INFO: FUNCIONAVA COM A LINHA ABAIXO, so que queremos generalizar para qualquer stateless
  // const isModule = fileSchema.filePath.includes(".module.");
  const isModule = !hasWidgetPropsCheck(fileSchema.content);
  const isStateless = !hasWidgetPropsCheck(fileSchema.content);
  console.log(
    "IS STATELLESSSSS ===>",
    isStateless,
    fileSchema.filePath,
    isModule,
  );

  // So transforma em Widget os componentes quem tem propriedades de Widget
  // useState, useEffect, State.init
  // const hasWidgetProps = hasWidgetPropsCheck(fileSchema.content);
  // if (hasWidgetProps) {
  //   console.log("HAS WIDGET PROPS", fileSchema.filePath);
  // }
  // const hasWidgetProps = true;

  // Aceita arquivos da pasta /tools/ do alem
  // const isAlemVmFolder = fileSchema.filePath.includes("lib/alem-vm/");

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
  console.log("Imported Item for", fileSchema.filePath);
  console.log("\n\n");
  componentImports.forEach((importedItem) => {
    console.log("Item:", importedItem);
    let importedItemFileSource = getImportedElementFileSource(
      fileSchema.content,
      importedItem,
    );
    console.log("Item source:", importedItemFileSource);

    // console.log(
    //   "FUBABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA =>>>>>",
    //   importedItem,
    //   importedItemFileSource,
    //   getAlemComponentsPath(importedItem, importedItemFileSource),
    // );
    // if (getAlemComponentsPath(importedItem, importedItemFileSource)) {
    //   // TODO: criar um arquivo com o diretorio raíz
    //   const foo = path.join(
    //     ".",
    //     "node_modules/alem/lib/alem-vm/components/RouteLink.tsx",
    //   );

    //   console.log(
    //     "CERTOOOO ===>",
    //     foo,
    //     // getFilePathBasedOnParentAndChildFilePath(
    //     //   fileSchema.filePath,
    //     //   getAlemComponentsPath(importedItem, importedItemFileSource),
    //     // ),
    //   );

    //   let fileContent = fs.readFileSync(foo, "utf8");

    //   console.log("CERTOOOO ===>", foo);
    // }
    // NOTE: Teste => converte todo arquivo alem em caminhos readi

    // Se o caminho for null, quer dizer que é uma biblioteca e o arquivo
    // não está na pasta src
    if (!importedItemFileSource) {
      return;
    }

    // if (!importedItemFileSource) {
    //   log.error("File directory for the imported item not found!");
    //   process.exit(1);
    // }

    // 1o - Verifica se é um Componente do Alem, ser for, obtem o caminho
    // const alemImportedItemFileSource = getAlemComponentsPath(
    //   importedItem,
    //   importedItemFileSource,
    // );

    // console.log("ERRARAAAADOOOOOOO ===>", importedItemFileSource);

    // 2o - Se não for componente Alem, segue em frente e busca no esquema de arquivos
    // do projeto
    // if (!alemImportedItemFileSource) {
    importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
      fileSchema.filePath,
      importedItemFileSource,
    );
    // } else {
    //   importedItemFileSource = alemImportedItemFileSource;
    // }

    // importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
    //   fileSchema.filePath,
    //   importedItemFileSource,
    // );

    componentImportItems[importedItem] = importedItemFileSource;
  });
  console.log("\n\n");
  fileSchema.componentImportItems = componentImportItems;

  // Se nao for um JSX, processa o arquivo de forma normal &
  // Se nao estiver na pasta /widget
  // apenas pra gerar um js
  // if (!isJsxFile || (!hasWidgetProps && !isAlemToolsFolder)) {
  // if (!isJsxFile || !isAlemVmFolder) {
  if (!isJsxFile) {
    // FINAL: para arquivos nao JSX
    fileSchema.finalFileBundle = jsContent;
    return fileSchema;
  }

  // Se for JSX, inicia o processo de transformar num componente que retorna Widget

  // ITEM 3.1 - Apenas Widgets tem widgetName
  if (!isModule) {
    const componentName = getComponentName(jsContent);
    fileSchema.widgetName = componentName;

    // Se nao tiver função do componente, dispara erro
    if (!componentName) {
      log.error(`Error: ${fileSchema.filePath}: Component function not found!`);
    }
  }

  // console.log("ULTIMAMENTE ADNDANDO SOZINHO:", jsContent, componentParams);

  // SUPPORT FOR IMMEDIATE FUNCTION RETURNING ELEMENT - PART 1
  // Se a primeira linha do arquivo contiver elementos html, entao nao precisa processar
  // já que se trata de um arquivo stateless simples
  // ex: const ShareIcon = () => <span className="material-symbols-outlined">share</span>;
  if (
    (getFirstLineContent(jsContent).includes("<") ||
      getFirstLineContent(jsContent).endsWith("(")) &&
    !isModule
  ) {
    // console.log("FINAL JSX STATELESS", fileSchema.filePath);
    // console.log("\n\n");

    // Remove primeira e ultima linha deste arquivo
    // jsContent = jsContent.replaceAll(/^\s*[\r\n]/gm, " ");
    // const lines = jsContent.split("\n");
    // lines.shift();
    // lines.pop();
    // jsContent = lines.join("\n");

    // Aqui eu uso o conteúdo original bruto mesmo. O parser consegue dividir os elementos
    // o elemento [0] vai ser o inicio da funcao
    // o elemento [1] vai ser o corpo inteiro a partir do primeiro nó dos elementos html
    const htmlParsedFile = parse(fileSchema.content);
    jsContent = htmlParsedFile.childNodes[1].toString();

    // Encobre o conteúdo com um return
    jsContent = `
    return (
      ${jsContent}
    )
    `;

    // ERRO: reconhece o arquivo como componente, isso é errado. Ele deve ser reconhecido como um .ts .js forcado
    // Já que é uma funcao de retorno imediata. Isso causa erro quando um img ta usando ele

    // FINAL: para arquivos JSX stateless simples no formato do ex.
    fileSchema.finalFileBundle = jsContent;
    return fileSchema;
  }

  // Módulos (arquivos stateless) não devem ter seu conteúdo modificado
  if (!isModule) {
    // Remove o conteúdo do inicio da funcao para evitar quebra de linha
    jsContent = jsContent.replace(
      FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
      "()",
    );
  }
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

  // Módulos devem ter seu jsContent inteiro, sem remover ou alterar sua estrutura.
  // Isso é porque eles são helpers que retornam JSX. Arquivos que não lidam com JSX
  // também podem ser módulos
  if (!isModule) {
    // ITEM 4 (remover primeira linha)
    jsContent = removeLineFromText(jsContent, 1);

    // ITEM 5 (remover ultima linha)
    jsContent = removeLastLineFromText(jsContent);
  }
  // jsContent = jsContent
  //   .replaceAll(methodInitialContent, "")
  //   .replaceAll(ALL_BLANK_LINES, "");

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

  if (fileSchema.componentParamsItems && !isModule) {
    jsContent = `
    const { ${[...fileSchema.componentParamsItems]} } = props;
    ${jsContent}
    `;

    // console.log("\n\n");
    // console.log("OASIS:", fileSchema.componentParamsItems);
    // console.log("\n\n");
  }

  // ITEM 6:
  // Adiciona o exportador de propriedades do componente
  // jsContent = `
  // const { ${[...componentParams]} } = props;
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
 *
 * Esta funcão retorna dentro de um objeto htmlElementsProps uma lista de cada componente ou element com seu nome e propriedades.
 *
 * Entrada de exemplo:
 *
 * <>
 * <p>Olá</p>
 * <MeuComponente name="Wendz" age={2} complex={{foo: "foo", bar: "bar"}} />
 * <MeuComponente name="Lukinha" />
 * </>
 *
 * Saída do schema atualizado:
 * ...
 * htmlElementsProps: {
 *  p: [{
 *    name: "p",
 *    props: {}
 *  }],
 *  MeuComponenet: [{
 *    name: "MeuComponente",
 *    props: {
 *      name: "Wendz"
 *      age: 2,
 *      complex: { foo: "foo", bar: "bar" }
 *    }
 *  }, {
 *    name: "MeuComponente",
 *    props: {
 *       name: "Lukinha"
 *    }
 *  }]
 * }
 * ...
 *
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const populateHtmlElementsProps = (fileSchema) => {
  const htmlElements = extractHtmlElements(fileSchema.finalFileBundle);
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);
  // const foo = extractHtmlCompleteElements(fileSchema.finalFileBundle);
  // console.log("======= File Final Bundle =========");
  // console.log(foo);
  // console.log("\n\n");

  let htmlElementProps = {};
  htmlElements.forEach((elementHtml) => {
    const elementName = getHtmlElementName(elementHtml);
    const elementProps = getHtmlElementProps(elementHtml);
    // const elementChildren = getHtmlElementChildren(elementHtml);
    // console.log("CHILDREN DOS OBJ:", elementHtml);

    if (elementName) {
      if (!htmlElementProps[elementName]) {
        htmlElementProps[elementName] = [];
      }

      // Registra cada elemento em array, cada item
      // do array é um filho do componente pai.
      // É usando um array porque um pai pode usar repetidas vezes
      // o mesmo tipo de componente filho
      htmlElementProps[elementName].push({
        name: elementName,
        props: elementProps,
      });
    }
  });

  //INFO:
  // Salva os childrens de cada elemento
  // Supoe-se que a quantidade de elementos encontrado nessa parte é a mesma capiturada acima para obter os "htmlElementProps"
  // Já que esse módulo ("node-html-parser") acha todos os elementos por query
  const root = parse(fileSchema.finalFileBundle);
  Object.keys(htmlElementProps).forEach((elementKeyName) => {
    // Define o children de cada elemento baseado no seu indice

    const elements = root.getElementsByTagName(elementKeyName);

    // Registra o children de cada elemento (elementKeyName) achado
    elements.forEach((element, elementIndex) => {
      // console.log("============");
      // console.log(element.childNodes.join(""));
      // console.log(htmlElementProps[elementKeyName][elementIndex]);
      // console.log("\n\n");

      const childrenContent = element.childNodes
        .join("")
        .replaceAll(MORE_THAN_ONE_SPACE, "");

      htmlElementProps[elementKeyName][elementIndex].props = {
        ...htmlElementProps[elementKeyName][elementIndex].props,
        ...(childrenContent
          ? { children: `"${scapeBacktick(childrenContent)}"` }
          : {}),
      };

      // console.log("============");
      // console.log(element.childNodes.join(""));
      // console.log(htmlElementProps[elementKeyName][elementIndex]);
      // console.log("\n\n");
    });

    // console.log(
    //   "SUPOSICAO de quantidade achada:",
    //   elementKeyName,
    //   root.getElementsByTagName(elementKeyName).length,
    // );
  });
  // console.log("HTML Elements Props");
  // console.log(htmlElementProps.props);
  // console.log('SUPOSICAO de quantidade achada:', root.getElementsByTagName("Banner"))
  // console.log("\n\n");

  // Seta os valores
  fileSchema.htmlElementsProps = htmlElementProps;

  // console.log("Updated Schema", fileSchema);
  // console.log("\n\n");

  return fileSchema;
};

// Arquivos sinalizados que devem ser processados pelo "injectFilesDependencies" posteriormente devido
// a falta de outro arquivo que ainda não tenha sido processado
// const pending_injectFilesDependencies = [];
// const postponedInjections = [];
// const postponedInjectionsFilePath = [];

/**
 * Coloca o conteúdo dos arquivos nao .ts e .jsx de dependencia dentro do bundle de cada arquivo do schema global
 * Esse é um processo que ocorre para todos os arquivos, mas somente copia e cola o conteudo para arquivos nao JSX.
 *
 * Arquivos reconhecidos como JSX (Widgets) serão tratados de outra forma. Ver "swapComponentsForWidgets"
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const injectFilesDependencies = (fileSchemas, fileSchema) => {
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);
  // console.log("\n\n");
  const pastedFiles = [];
  let fileBundle = fileSchema.finalFileBundle;

  // Checa se o item faz parte de componentes
  // console.log("\n\n");
  // console.log(
  //   "ARQUIVO =:",
  //   fileSchema.filePath,
  //   "========>",
  //   fileSchema.componentImportItems,
  // );
  // console.log(fileSchema);
  Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
    // Se for item não widget, inclui no topo do bundle do arquivo

    // console.log(
    //   "PROCESSANDO AGORA:",
    //   "ARQUIVO:",
    //   fileSchema.filePath,
    //   "IMPORT ITEM:",
    //   importItem,
    // );

    // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
    const importItemFilePath = fileSchema.componentImportItems[importItem];
    // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
    if (importItemFilePath && !pastedFiles.includes(importItemFilePath)) {
      // Adiciona na lista de items ja processados
      pastedFiles.push(importItemFilePath);

      // Is import item comming from JSX | TSX file?
      const isImportItemCommingFromJsxFile =
        importItemFilePath.endsWith("tsx") ||
        importItemFilePath.endsWith("jsx");

      const isModule = importItemFilePath.includes(".module.");

      // console.log("É um componente/Widget?", isImportItemCommingFromJsxFile);
      // NAO WIDGETS | MODULOS (arquivos que contenham "module" no nome): tem o conteúdo de seu arquivo copiado e colado no corpo do arquivo sendo processado atual
      if (isImportItemCommingFromJsxFile || isModule) {
        // Load file content (copy and paste file content where this import item is comming from)
        // Files without source are the ones that not live in the src directory
        const importItemFileSource =
          fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

        if (importItemFileSource) {
          // console.log("=======INJECAO DE ARQUIVOS .TS=====");
          // console.log(importItemFileSource);
          // console.log("\n\n");
          // Le os dados do arquivo já processado (usando o fileSchema dele)

          let importItemFileContent = fileSchemas.find(
            (importFileSchema) =>
              importFileSchema.filePath === importItemFileSource,
          );

          const importItemHasWidgetProps = hasWidgetPropsCheck(
            importItemFileContent.content,
          );

          // if (!importItemHasWidgetProps) {
          //   return;
          // }

          // Se algum dependente ja tiver injetado esse item na sub-dependencia, pula a injeção
          if (
            fileSchema.injectedFiles &&
            fileSchema.injectedFiles.includes(importItemFileContent.filePath)
          ) {
            console.log(
              "JA TA INSERIDO PAEEEE",
              fileSchema.filePath,
              importItemFileContent.filePath,
            );
            return;
          }

          // Funcao recursiva aqui para fazer com que arquivos ainda não processados pelo injection, sejam primeiro
          if (!importItemFileContent.injectFilesDependencies_Done) {
            // Faz o processo primeiro no arquivo dependente

            // console.log(
            //   "=======RECURSIVIDADE A=====",
            //   importItemFileContent.filePath,
            // );
            // updated "importItemFileContent"
            importItemFileContent = injectFilesDependencies(
              fileSchemas,
              importItemFileContent,
            );

            // console.log("=======RECURSIVIDADE B=====");
            // console.log(importItemFileContent);
            // console.log("\n\n");

            // updatedChildFileSchemas.push(...)
          }

          // Checa se o item a ser injetado já foi processado
          // console.log(
          //   "DONE:",
          //   fileSchema.filePath,
          //   importItemFileContent.injectFilesDependencies_Done,
          // );
          // if (!importItemFileContent.injectFilesDependencies_Done) {
          //   // Caso não tenha sido processado ainda, coloca este arquivo fileSchema
          //   // para ser processado depois
          //   if (!postponedInjectionsFilePath.includes(fileSchema.filePath)) {
          //     fileSchema.injectFilesDependencies_Done = false;
          //     postponedInjections.push(fileSchema);
          //     postponedInjectionsFilePath.push(fileSchema.filePath);
          //   }
          //   // return;
          // }

          const itemBundle = importItemFileContent.finalFileBundle;
          // console.log(
          //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
          //   fileSchema.filePath,
          //   importItemFileContent,
          // );
          // const importItemFileContent = fs.readFileSync(
          //   importItemFileSource,
          //   "utf8",
          // );

          // console.log(
          //   `======= Import Item File Source =========> ${importItem} => ${importItemFileSource}`,
          // );
          // console.log(importItemFileContent);
          // console.log("\n\n");

          if (!importItemHasWidgetProps) {
            fileBundle = `
            ${itemBundle}

            ${fileBundle}
            `;
          }

          // fileBundle = `
          // ${itemBundle}

          // ${fileBundle}
          // `;

          // Sinaliza que o procsso de injecao foi finalizado neste arquivo
          fileSchema.injectFilesDependencies_Done = true;

          // Insere os arquivos dependentes que já foram inseridos no bundle. Isso evita duplicatas de conteúdo
          if (!fileSchema.injectedFiles) {
            fileSchema.injectedFiles = [];
          }
          // Deve guardar as informações da injeção da dependencial atual e as dependencias da dependencia atual
          console.log(
            "SO PRA CHECKKKKKKK =====>>>>",
            importItemFileContent.injectedFiles,
          );
          console.log("\n\n");

          fileSchema.injectedFiles.push(
            importItemFileContent.filePath,
            ...(importItemFileContent.injectedFiles
              ? importItemFileContent.injectedFiles
              : []),
          );

          // Redefine bundle atualizado
          fileSchema.finalFileBundle = fileBundle;
          // console.log("ESCHEMAAAAAAA =========", fileSchema.finalFileBundle);
        }
      }
    }
  });

  return fileSchema;
};

/**
 * Faz o procedimento de trocar componentes nome de componentes por <Widget code={...} />
 *
 * Similar ao "swapComponentsForWidgets", mas aqui, somente os arquivos stateless são processados
 *
 * @param {*} fileSchemas
 * @param {*} fileSchema
 * @returns
 */
const swapComponentsForStatelessFiles = (fileSchemas, fileSchema) => {
  // 1 - Widget Only
  // 2 - Copia o conteúdo (code) da dependencia usando o nome do componente
  // e usa esse code dentro do <Widget /> nas posições onde tem quer ser usado esse componente
  // ex:
  /**
   * - arquivo ComponentB -
   * const ComponentA = `code do componente`
   *
   * const SubTitle = `code do componente`
   *
   * return (
   *    <>
   *        <p>Olá Mundo</p>
   *        <Widget code={ComponentA} props={{label: "oi mundo"}}/>
   *        <Widget code={ComponentA} props={{label: "larica sinistra"}}/>
   *        <h1>Projeto</h1>
   *        <Widget code={SubTitle} props={{text: "Projeto Maroto"}}/>
   *    </>
   * )
   */

  // const hasHtmlElements = fileSchema.content.includes(HTML_ELEMENT);
  const _hasHtmlElements = hasHtmlElements(fileSchema.content);

  // const isModule = fileSchema.filePath.includes(".module.");
  const hasWidgetProperties = hasWidgetPropsCheck(fileSchema.content);

  console.log(
    "============================================>>>>>",
    fileSchema.filePath,
  );

  // IS NOT Widget && fileBundle has html elements
  if (!fileSchema.widgetName && _hasHtmlElements && !hasWidgetProperties) {
    const pastedFiles = [];
    let fileBundle = fileSchema.finalFileBundle;

    Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
      // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
      const importItemFilePath = fileSchema.componentImportItems[importItem];
      // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
      if (importItemFilePath && !pastedFiles.includes(importItemFilePath)) {
        // Adiciona na lista de items ja processados
        pastedFiles.push(importItemFilePath);

        // Is import item comming from JSX | TSX file?
        const isImportItemCommingFromJsxFile =
          importItemFilePath.endsWith("tsx") ||
          importItemFilePath.endsWith("jsx");

        if (isImportItemCommingFromJsxFile) {
          // https://www.npmjs.com/package/node-html-parser#global-methods
          const rootHTML = parse(fileBundle, { voidTag: { tags: [] } });

          // Files without source are the ones that not live in the src directory

          // INFO: Verifica se o caminho do arquivo a ser processado não é "null"
          const importItemFileSource =
            fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

          // Se existir o conteúdo localmente... segue...
          if (importItemFileSource) {
            // NOTE: Aqui que a magica acontece!!!!

            // console.log(fileSchemas);
            // console.log("IMPORT ITEM FILE SOURCE:");
            // console.log(importItemFileSource);

            // // 2o Se não for, continua a busca por Componente/Widget do projeto
            // let importItemWidgetName = null;
            // if (!alemImportItemWidgetName) {
            // Le o nome do Widget dependente (usando o fileSchema dele)
            const importItemWidget = fileSchemas.find(
              (importFileSchema) =>
                importFileSchema.filePath === importItemFileSource,
            );

            // let importItemWidgetName = importItemWidget.widgetName;

            // NEW
            const importItemWidgetComponentName = getComponentName(
              importItemWidget.finalFileBundle,
            );

            // } else {
            //   importItemWidgetName = alemImportItemWidgetName;
            // }

            // console.log(
            //   "22222222222222222222222222222222 ========>",
            //   importItemWidgetComponentName,
            // );

            if (importItemWidgetComponentName) {
              // Processa todos os componentes filhos
              // Cada elemento do mesmo tipo é um filho diferente que foi adicionado ao elemento pai
              const importItemElements =
                fileSchema.htmlElementsProps[importItemWidgetComponentName] ||
                [];

              console.log(
                "AAAA",
                importItemElements,
                importItemWidgetComponentName,
                fileSchema.filePath,
              );

              // Usa o rootHTML (conteúdo html do componente) para pegar a lista de Componentes do tipo desejado. ex: Title
              const componentElements = rootHTML.getElementsByTagName(
                importItemWidgetComponentName,
              );

              console.log("BBBBB", componentElements);

              // Transfor cada componente em Widget com suas propriedades
              componentElements.forEach((div, divIndex) => {
                // Converte as propriedades em um texto contendo a sequencia de chaves e valores das propriedades do Componente
                const childProps = (
                  importItemElements[divIndex]
                    ? importItemElements[divIndex]
                    : { props: {} }
                ).props;
                console.log("======= TYESTE DO MALACDO PROPS =======");
                console.log(childProps);
                console.log("\n\n");

                const importItemPropsStringSequence =
                  convertObjectToArray(childProps).join(",");

                console.log("======= TYESTE DO MALACDO PROPS =======");
                // console.log(childProps);
                // console.log("=======");
                console.log(importItemPropsStringSequence);
                console.log("\n\n");

                const span = new parse(
                  `<Widget code={props.alem.componentsCode.${importItemWidgetComponentName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }}>`,
                ).childNodes[0];
                div.replaceWith(span);
              });

              fileBundle = rootHTML.toString();
            }

            console.log(rootHTML.toString());

            fileSchema.finalFileBundle = fileBundle;
          }
        }
      }
    });
  }

  return fileSchema;
};

/**
 * Varre todos os componentes e verifica se são Widgets, se for o caso, troca os componentes por <Widget code='' props />
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const swapComponentsForWidgets = (fileSchemas, fileSchema) => {
  // 1 - Widget Only
  // 2 - Copia o conteúdo (code) da dependencia usando o nome do componente
  // e usa esse code dentro do <Widget /> nas posições onde tem quer ser usado esse componente
  // ex:
  /**
   * - arquivo ComponentB -
   * const ComponentA = `code do componente`
   *
   * const SubTitle = `code do componente`
   *
   * return (
   *    <>
   *        <p>Olá Mundo</p>
   *        <Widget code={ComponentA} props={{label: "oi mundo"}}/>
   *        <Widget code={ComponentA} props={{label: "larica sinistra"}}/>
   *        <h1>Projeto</h1>
   *        <Widget code={SubTitle} props={{text: "Projeto Maroto"}}/>
   *    </>
   * )
   */

  // TODO: Estou tentando entender porque o Spinner não esta sendo transformado em Widget dentro do MarkdownPage
  // console.log("========== TESTANDO AAAAAAAA ==========");
  // console.log(fileSchema.widgetName, fileSchema.filePath);
  // console.log("\n\n");

  // IS Widget
  if (fileSchema.widgetName) {
    // console.log("======= File Final Bundle =========");
    // console.log(fileSchema.finalFileBundle);
    // console.log("HTML Elements:", htmlElements);
    // console.log("\n\n");
    const pastedFiles = [];
    let fileBundle = fileSchema.finalFileBundle;

    // Checa se o item faz parte de componentes
    // console.log("\n\n");
    // console.log(
    //   "ARQUIVO =:",
    //   fileSchema.filePath,
    //   "========>",
    //   fileSchema.componentImportItems,
    // );
    // console.log(fileSchema);
    Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
      // console.log(
      //   "PROCESSANDO AGORA:",
      //   "ARQUIVO:",
      //   fileSchema.filePath,
      //   "IMPORT ITEM:",
      //   importItem,
      // );

      // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
      const importItemFilePath = fileSchema.componentImportItems[importItem];
      // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
      if (importItemFilePath && !pastedFiles.includes(importItemFilePath)) {
        // Adiciona na lista de items ja processados
        pastedFiles.push(importItemFilePath);

        // Is import item comming from JSX | TSX file?
        const isImportItemCommingFromJsxFile =
          importItemFilePath.endsWith("tsx") ||
          importItemFilePath.endsWith("jsx");

        const isModule = importItemFilePath.includes(".module.");

        // console.log("É um componente/Widget?", isImportItemCommingFromJsxFile);

        // WIDGET FILES & NAO MÓDULO (arquivos que tenham .module. no nome): Os componentes identificados como widgets são trocados por <Widget code=`<widget_code>` props={} />
        // o code do Widget sendo usado também é importado
        // TODO: pensar nisso, tem alguma forma de usar uma referencia desse code? Vindo do State global talvez?.
        // TODO: copiar e colar o codigo dentro de cada arquivo que depende dele pode deixar o bundle muito grande.

        if (isImportItemCommingFromJsxFile && !isModule) {
          // https://www.npmjs.com/package/node-html-parser#global-methods
          const rootHTML = parse(fileBundle, { voidTag: { tags: [] } });

          // Files without source are the ones that not live in the src directory
          // console.log(
          //   "ATUAL ========>>>>>>> ",
          //   fileSchema.filePath,
          //   fileSchema.componentImportItems,
          // );
          // INFO: Verifica se o caminho do arquivo a ser processado não é "null"
          const importItemFileSource =
            fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

          // Se existir o conteúdo localmente... segue...
          if (importItemFileSource) {
            // NOTE: Aqui que a magica acontece!!!!

            // console.log(fileSchemas);
            // console.log("IMPORT ITEM FILE SOURCE:");
            // console.log(importItemFileSource);

            // INFO: Pega o nome do Widget
            // 1o Verifica se é um Component/Widget do Alem
            // let alemImportItemWidgetName =
            //   getAlemComponentNameByFilePath(importItemFileSource);

            // // 2o Se não for, continua a busca por Componente/Widget do projeto
            // let importItemWidgetName = null;
            // if (!alemImportItemWidgetName) {
            // Le o nome do Widget dependente (usando o fileSchema dele)
            const importItemWidget = fileSchemas.find(
              (importFileSchema) =>
                importFileSchema.filePath === importItemFileSource,
            );

            let importItemWidgetName = importItemWidget.widgetName;
            // INFO: Aqui é onde os arquivos Stateless são impedidos de serem processados e se tornar <Widget>
            // Eles sofrem essa alteração somente no método "swapComponentsForStatelessFiles"
            const importItemHasWidgetProperties = hasWidgetPropsCheck(
              importItemWidget.content,
            );
            // } else {
            //   importItemWidgetName = alemImportItemWidgetName;
            // }

            // console.log(
            //   "22222222222222222222222222222222 ========>",
            //   importItemWidgetName,
            // );

            if (importItemWidgetName && importItemHasWidgetProperties) {
              // Processa todos os componentes filhos
              // Cada elemento do mesmo tipo é um filho diferente que foi adicionado ao elemento pai
              const importItemElements =
                fileSchema.htmlElementsProps[importItemWidgetName] || [];

              //============= NEW
              // importItemElements:
              // 1 - Ja tenho o array de elementos do tipo do Componente, ex: Title: [{...}, {...}]
              //
              // 2 -

              // console.log("AAAAA", importItemWidgetName);

              // Usa o rootHTML (conteúdo html do componente) para pegar a lista de Componentes do tipo desejado. ex: Title
              const componentElements =
                rootHTML.getElementsByTagName(importItemWidgetName);

              // console.log("BBBB");

              // Transfor cada componente Title em Widget com suas propriedades
              componentElements.forEach((div, divIndex) => {
                // Converte as propriedades em um texto contendo a sequencia de chaves e valores das propriedades do Componente
                const childProps = (
                  importItemElements[divIndex]
                    ? importItemElements[divIndex]
                    : { props: {} }
                ).props;
                // console.log("======= TYESTE DO MALACDO PROPS =======");
                // console.log(childProps);
                // console.log("\n\n");

                const importItemPropsStringSequence =
                  convertObjectToArray(childProps).join(",");

                // console.log("======= TYESTE DO MALACDO PROPS =======");
                // console.log(childProps);
                // console.log("=======");
                // console.log(importItemPropsStringSequence);
                // console.log("\n\n");

                const span = new parse(
                  `<Widget code={props.alem.componentsCode.${importItemWidgetName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }}>`,
                ).childNodes[0];
                div.replaceWith(span);
              });

              // console.log("======= TYESTE DO MALACDO PROPS =======");
              // console.log(childProps);
              // console.log("=======");
              // console.log(importItemPropsStringSequence);
              // console.log(rootHTML.toString());
              // console.log("\n\n");
              fileBundle = rootHTML.toString();
            }

            // <Widget code={props.alem.componentsCode.Watcher} props={{...({fallback: "Esperando...",children: '', ...props })}}></Widget>

            //============= NEW

            // importItemElements.forEach((child) => {
            //   // Pega as propriedades passadas pelo componente pai para este componente de dependencia
            //   // Formato da chave encontrada: { name: '<component name>', props: {...} }
            //   const childProps = (child ? child : { props: {} }).props;

            //   // Converte as propriedades em um texto contendo a sequencia de chaves e valores das propriedades
            //   const importItemPropsStringSequence =
            //     convertObjectToArray(childProps).join(",");
            //   // console.log("\n\n");
            //   // console.log("PROPRIEDADES:", childProps, childIndex);
            //   console.log("CHECK:", importItemWidgetName);
            //   console.log("\n\n");

            //   // INFO:
            //   // props={{ text: "any test prop here", alem: props.alem }}
            //   // "alem: props.alem"
            //   // TODO: injetar as propriedades do proprio componente por indice de ocorrencia
            //   let elementFragment = replaceWordAfterTheLessThanSign(
            //     fileBundle,
            //     importItemWidgetName,
            //     // TODO: pegar cada tipo de <></> <Bla/>
            //     `<Widget code={props.alem.componentsCode.${importItemWidgetName}} props={{ ...({${importItemPropsStringSequence}}), ...props }}`,
            //   );

            //   // Remove o restante do conteúdo depois do Widget
            //   // const rightContentLeft = new RegExp(
            //   //   `/>[^<]*<\\/${importItemWidgetName}>/`,
            //   // );
            //   // elementFragment = elementFragment.replace(
            //   //   rightContentLeft,
            //   //   "BBBBB",
            //   // );
            //   // console.log(rightContentLeft, elementFragment);

            //   fileBundle = elementFragment;

            //   // TODO: 1 - Pegar o children do componente e passar como props - FEITO
            //   // TODO: 2 - como o <Widget /> é um elemento com auto fechamento, tem que remover o restando do texto depois dele
            //   /**
            //    * <Title>Ola meu nobre</Title>
            //    * Ta ficando assim atualmente:
            //    * <Widget code={Title} props={{ ... }}>Ola meu nobre</Title>
            //    * Esse final "Ola meu nobre</Title>" Tem que ser removido e o conteúdo entre as chaves tem quer virar children, assim:
            //    * <Widget code={Title} props={{ children: "Ola meu nobre" }}>   ==> pode ser qualquer conteúdo no meio
            //    */
            //   // TODO: Testar children nos widgets
            //   // TODO: o escape e como renderizar o children esta no NEAR SOCIAL Editor
            //   // TODO: Wedget nao foi feito para receber children <>children</>, mas meu compilador ta passando como props isso
            //   // TODO: e deve renderizar o children dentro de um Widget do outro lado. Assim:
            //   // TODO: if (props.children) `<Widget code={\`return (<>\${props.children}</>)\`} />`
            // });

            fileSchema.finalFileBundle = fileBundle;

            // Pega as propriedades passadas pelo componente pai para este componente de dependencia
            // Formato da chave encontrada: { name: '<component name>', props: {...} }
            // const importItemProps = (
            //   fileSchema.htmlElementsProps[importItemWidgetName]
            //     ? fileSchema.htmlElementsProps[importItemWidgetName]
            //     : { props: {} }
            // ).props;

            // // Converte as propriedades em um texto contendo a sequencia de chaves e valores das propriedades
            // const importItemPropsStringSequence =
            //   convertObjectToArray(importItemProps).join(",");
            // console.log("\n\n");
            // console.log("PROPRIEDADES:", importItemProps);
            // console.log("CHECK:", importItemPropsStringSequence);
            // console.log("\n\n");

            // Troca os nomes dos componentes dessa dependencia por <Widget code={props.NomeComponente} props={...} />
            // ACHAR E TROCAR:
            // 1 - Componentes com chave única: <Componente />
            // 2 - Componentes com children: <Componente>alguma coisa</Componente>
            // 2.2 - Se tiver conteúdo no meio, enviar como children
            // No cado do 2, todo o conteúdo deve ser removido, o conteúdo entre as chaves (<> AQUI </>) deve
            // ser enviado para as props como children.

            // console.log("ESCHEMAAAAAAA =========", fileSchema.finalFileBundle);
          }
        }
      }
    });
  }

  return fileSchema;
};

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]}
 */
const transformSchemaToWidget = (fileSchemas) => {
  // TODO: trocar esse nome, transformSchemaToWidget -> transformSchemaToWidgetSchema

  // INFO: A ordem aqui importa!!!

  // Gera o primeiro finalFileBundle e widgetName(para Widgets somente), parametros e imports
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = processSchema(fileSchema);
  });

  // Adiciona os dados de cada elemento HTML no schema de cada arquivo
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que tenham conteúdo Widget apenas
    // if (fileSchema.widgetName) {
    fileSchemas[fileSchemaIndex] = populateHtmlElementsProps(fileSchema);
    // }
  });

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que contenham elementos html mas são stateless
    fileSchemas[fileSchemaIndex] = swapComponentsForStatelessFiles(
      fileSchemas,
      fileSchema,
    );
  });

  // Copia e cola o conteúdo de arquivos não .tsx | .jsx para dentro dos arquivos que dependem deles
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = injectFilesDependencies(
      fileSchemas,
      fileSchema,
    );
  });

  // Refaz o processo de injeção em arquivos que ficaram com a injeção pendente.
  // Isso pode ocorrer com o último arquivo/primeiro arquivo da lista de schema já que talvez algum
  // recurso anterior ainda não tenha sido processado pelo injectFilesDependencies
  // const pendingFilesToInjectFilesDependencies
  // fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
  //   if (!fileSchema.injectFilesDependencies_Done) {
  //     fileSchemas[fileSchemaIndex] = injectFilesDependencies(
  //       fileSchemas,
  //       fileSchema,
  //     );
  //   }
  // });

  // console.log("Postponed Injections (filePath):");
  // console.log(postponedInjectionsFilePath);
  // console.log("\n\n");

  // console.log('Postponed Injections (schemas):')
  // console.log(postponedInjections)
  // console.log('\n\n');

  // Faz a troca de <Componentes> dentro de cada arquivo por <Widget> se um Widget for detectado como dependencia
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que tenham conteúdo Widget apenas
    fileSchemas[fileSchemaIndex] = swapComponentsForWidgets(
      fileSchemas,
      fileSchema,
    );
    //
    // fileSchemas[fileSchemaIndex] = populateHtmlElementsProps(fileSchema);
    // console.log(fileSchema.htmlElementsProps);
  });

  // console.log("File Schemas:", fileSchemas);
  // console.log("File Schemas:", fileSchemas.widgetName, fileSchemas.componentImportItems);

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
