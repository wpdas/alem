const { parse } = require("node-html-parser");
const {
  getFileImportsElements,
  getFileComponents,
  getComponentName,
  removeLineFromText,
  removeLastLineFromText,
  getImportedElementFileSource,
  getFilePathBasedOnParentAndChildFilePath,
  convertObjectToArray,
} = require("../helpers");
const { process_file_content, removeImports } = require("../parse");
const {
  ALL_BLANK_LINES,
  MORE_THAN_ONE_SPACE,
  LINE_BREAKS,
} = require("../regexp");
const { log } = require("../utils");
const PROHIBITED_METHODS = require("../config/prohibitedMethods");
const hasWidgetPropsCheck = require("./hasWidgetPropsCheck");
const importableFiles = require("../config/importableFiles");
const extractPropsFromJSX = require("../parsers/extractPropsFromJSX");
const extractJSXElements = require("../parsers/extractJSXElements");
const extractJSX = require("../parsers/extractJSX");
const replaceJSXElement = require("../parsers/replaceJSXElement");
const extractJSXChildren = require("../parsers/extractJSXChildren");
const processChildrenWidget = require("./processChildrenWidget");
const transformImports = require("../parsers/transformImports");
const analyzeFunctionSignature = require("../parsers/analyzeFunctionSignature");
const removeFunctionParams = require("../parsers/removeFunctionParams");
const transformAsyncAwait = require("../parsers/transformAsyncAwait");

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

  // TODO: criar configuracao (autoInjectStatelessComponents):
  // TODO: true: auto injeta componentes q n tem recursos de Widget como componente simples
  // TODO: false: injeta somente os arquivos que tenham ".module." no nome.
  // Verifica se é o arquivo principal index.tsx | index.jsx
  const isIndex =
    fileSchema.filePath.includes("src/index.tsx") ||
    fileSchema.filePath.includes("src/index.jsx");

  let isModule =
    (fileSchema.filePath.includes(".module.") ||
      !hasWidgetPropsCheck(fileSchema.content)) &&
    !isIndex;

  // Se o componente for stateful, mesmo tendo o nome .module., ele é definido como não module
  if (hasWidgetPropsCheck(fileSchema.content)) {
    isModule = false;
  }
  // const isModule =
  //   fileSchema.filePath.includes(".module.") ||
  //   !hasWidgetPropsCheck(fileSchema.content);

  // console.log("============== Estrada =============");
  // console.log(fileSchema.filePath);
  // console.log(hasWidgetPropsCheck(fileSchema.content));
  fileSchema.isModule = isModule;

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

  // Conteúdo puro apenas com a remoção de elementos typescript, import e exports
  fileSchema.pureJsContent = process_file_content(
    fileSchema.content,
    transpileTypescript,
  );

  // ITEM 1
  let componentImports = getFileImportsElements(jsContent);
  componentImports = removeProhibitedMethods(componentImports);

  // Remove imports (isso foi inibido no process_file_content no terceiro parametro)
  jsContent = removeImports(jsContent).replaceAll(ALL_BLANK_LINES, ""); // remove linhas em branco;

  // ITEM 3.2

  // remove qualquer propriedade "props", ja que vai ser inclusa automaticamente
  // componentImports = componentImports.filter((item) => item !== "props");
  // Já esta sendo feito pelo "removeProhibitedMethods"

  // Only JSX files has the "componentParamsItems" props
  // if (isJsxFile) {
  //   const componentParams = getComponentParams(jsContent);
  //   console.log("ANALISE DE CONSTRUCTOR:", fileSchema.filePath);
  //   console.log(jsContent);
  //   // TODO: Usar isso diretamente no lugar que seta os parametros
  //   console.log(analyzeFunctionSignature(jsContent));
  //   console.log("\n");
  //   fileSchema.componentParamsItems = componentParams.filter(
  //     (item) => item !== "props",
  //   );
  // }

  // Pega e registra o diretório do arquivo de cada dependencia/imported item
  const componentImportItems = {};

  // console.log("Imported Item for", fileSchema.filePath);
  // console.log("Components Imports:", componentImports);
  // console.log("\n\n");

  componentImports.forEach((importedItem) => {
    // console.log("Item:", importedItem);
    let importedItemFileSource = getImportedElementFileSource(
      fileSchema.content,
      importedItem,
    );
    // console.log("Item - file Source::", importedItemFileSource);
    // console.log("Item source:", importedItemFileSource);

    // NOTE: Teste => converte todo arquivo alem em caminhos readi

    // Se o caminho for null, quer dizer que é uma biblioteca e o arquivo
    // não está na pasta src
    if (!importedItemFileSource) {
      return;
    }

    // 1o - Verifica se é um Componente do Alem, ser for, obtem o caminho

    // 2o - Se não for componente Alem, segue em frente e busca no esquema de arquivos
    // do projeto

    // 1 - Verifica se é um arquivo que vem da lib Além
    const isAlemFile = importedItemFileSource.includes(
      "lib/alem-vm/importable",
    );

    // 2 - Se não for, continua o processo normalmente, se for, ignora o tratamento abaixo
    if (!isAlemFile) {
      importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
        fileSchema.filePath,
        importedItemFileSource,
      );
    }

    componentImportItems[importedItem] = importedItemFileSource;
  });
  // console.log("\n\n");
  fileSchema.componentImportItems = componentImportItems;

  // Se nao for um JSX, processa o arquivo de forma normal &
  // Se nao estiver na pasta /widget
  // apenas pra gerar um js
  // if (!isJsxFile || (!hasWidgetProps && !isAlemToolsFolder)) {
  // if (!isJsxFile || !isAlemVmFolder) {
  if (!isJsxFile) {
    // FINAL: para arquivos nao JSX
    fileSchema.finalFileBundle = jsContent;
    fileSchema.jsContent = jsContent;
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

  // SUPPORT FOR IMMEDIATE FUNCTION RETURNING ELEMENT - PART 1
  // Se a primeira linha do arquivo contiver elementos html, entao nao precisa processar
  // já que se trata de um arquivo stateless simples
  // ex: const ShareIcon = () => <span className="material-symbols-outlined">share</span>;

  if (
    (getFirstLineContent(jsContent).includes("<") ||
      getFirstLineContent(jsContent).endsWith("(")) &&
    !isModule
  ) {
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
    fileSchema.jsContent = jsContent;
    return fileSchema;
  }

  // Módulos (arquivos stateles) não devem ter seu conteúdo modificado
  if (!isModule) {
    // Remove o conteúdo do inicio da funcao para evitar quebra de linha
    // jsContent = jsContent.replace(
    //   FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
    //   "()",
    // );
    jsContent = removeFunctionParams(jsContent);
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

  if (!isModule) {
    const componentParams = analyzeFunctionSignature(fileSchema.pureJsContent);

    if (componentParams.capturedParams) {
      jsContent = `
    const ${componentParams.capturedParams} = props;
    ${jsContent}
    `;
    }
  }

  // FINAL
  // Injeta o conteúdo final de widget no arquivo
  fileSchema.finalFileBundle = jsContent;
  fileSchema.jsContent = jsContent;

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

  const pastedFiles = [];
  // let fileBundle = fileSchema.finalFileBundle;
  let fileBundle = fileSchema.jsContent;

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
        // const rootHTML = parse(fileBundle, {});

        // Files without source are the ones that not live in the src directory

        // INFO: Verifica se o caminho do arquivo a ser processado não é "null"
        const importItemFileSource =
          fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

        // Se existir o conteúdo localmente... segue...
        if (importItemFileSource) {
          // NOTE: Aqui que a magica acontece!!!!

          // Le o nome do Widget dependente (usando o fileSchema dele)
          let importItemWidget = fileSchemas.find(
            (importFileSchema) =>
              importFileSchema.filePath === importItemFileSource,
          );

          const importItemWidgetComponentName =
            importItemWidget.widgetName ||
            getComponentName(importItemWidget.finalFileBundle);

          if (importItemWidgetComponentName && !importItemWidget.isModule) {
            // Processa todos os componentes filhos
            // Cada elemento do mesmo tipo é um filho diferente que foi adicionado ao elemento pai
            // const importItemElements =
            //   fileSchema.htmlElementsProps[importItemWidgetComponentName] || [];

            // Usa o rootHTML (conteúdo html do componente) para pegar a lista de Componentes do tipo desejado. ex: Title
            // const componentElements = rootHTML.getElementsByTagName(
            //   importItemWidgetComponentName,
            // );

            const jsxOnly = extractJSX(fileSchema.content);

            const fixedJsxOnly =
              jsxOnly.length > 1
                ? `<>${jsxOnly.join("\n")}</>`
                : jsxOnly.join("\n");

            const componentElements = extractJSXElements(
              fixedJsxOnly,
              importItemWidgetComponentName,
            );

            // console.log(componentElements);

            // Transfor cada componente em Widget com suas propriedades
            componentElements.forEach((div, divIndex) => {
              // Converte as propriedades em um texto contendo a sequencia de chaves e valores das propriedades do Componente
              // const childProps = (
              //   importItemElements[divIndex]
              //     ? importItemElements[divIndex]
              //     : { props: {} }
              // ).props;

              const htmlElementString = componentElements[divIndex]
                .toString()
                .replaceAll(LINE_BREAKS, "")
                .replaceAll(MORE_THAN_ONE_SPACE, " ");

              let childProps = extractPropsFromJSX(htmlElementString);

              // console.log("======= TESTE DO MALACDO PROPS =======");
              // console.log(importItemFilePath);
              // console.log(childProps);
              // console.log("\n\n");

              // get the children
              let childChildren = extractJSXChildren(htmlElementString);
              if (childChildren) {
                childChildren = processChildrenWidget(
                  childChildren,
                  fileSchemas,
                );
                childProps = { ...childProps, children: childChildren };
              }
              // TODO: adicionar isso htmlElements

              // console.log("======= TESTE DO MALACDO PROPS =======");
              // console.log(div);
              // console.log(childProps);
              // console.log(htmlElementString);
              // console.log(childChildren);
              // console.log(childProps);
              // console.log("\n\n");

              const importItemPropsStringSequence =
                convertObjectToArray(childProps).join(",");

              // console.log("======= TYESTE DO MALACDO PROPS =======");
              // console.log(childProps);
              // console.log("=======");
              // console.log(importItemPropsStringSequence);
              // console.log("\n\n");

              // const fileParts = fileBundle.split(jsxOnly);
              // console.log("PARTESSS ===>", fileBundle);

              // Babel segue os padroes JS, por isso:
              // 1 - Adiciona uma uma função no topo
              // 2 - Fecha a função no final
              fileBundle = `const TempMethod = () => {\n${fileBundle}\n}`;
              // NOTE: nao adicionando a ultima linha, mas estou removendo a ultima linha
              // Caso quebre, ver isso. [Provavelmente o escape acima esta adicionando o } no final]

              // const span = new parse(
              //   `<Widget loading=" " code={props.alem.componentsCode.${importItemWidgetComponentName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }}>`,
              // ).childNodes[0];
              // div.replaceWith(span);

              fileBundle = replaceJSXElement(
                fileBundle,
                importItemWidgetComponentName,
                0,
                `<Widget loading=" " code={props.alem.componentsCode.${importItemWidgetComponentName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }} />`,
              );

              // Remove funcao no topo e ultima linha fechando a funcao
              fileBundle = fileBundle.replace("const TempMethod = () => {", "");
              fileBundle = removeLastLineFromText(fileBundle);
            });

            // fileBundle = rootHTML.toString();
          }

          // if (importItemWidgetComponentName && importItemWidget.isModule) {
          //   fileBundle = `

          //   ${importItemWidget.finalFileBundle}

          //   ${fileBundle}

          //   `;
          // }

          // console.log(rootHTML.toString());

          // Altera o jsContent com os Widgets
          fileSchema.jsContent = fileBundle;
          // Altera o finalBundle que é usado posteriormente
          fileSchema.finalFileBundle = fileBundle;
        }
      }
    }
  });
  // }

  // fileSchema.swapComponentsForStatelessFiles_Done = true;

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
const prepareListOfInjections = (fileSchemas, fileSchema) => {
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);
  // console.log("\n\n");
  const pastedFiles = [];
  // let fileBundle = fileSchema.finalFileBundle;

  // console.log("====== CHECAGEM DE INJECAO ======  ");
  // console.log("Arquivo sendo processado:", fileSchema.filePath);
  // console.log("Imports do arquivo:", fileSchema.componentImportItems);

  // Checa se o item faz parte de componentes
  Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
    // Se for item não widget, inclui no topo do bundle do arquivo

    // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
    const importItemFileSource = fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null
    // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
    if (importItemFileSource && !pastedFiles.includes(importItemFileSource)) {
      // Adiciona na lista de items ja processados
      pastedFiles.push(importItemFileSource);

      // Is import item comming from JSX | TSX file?
      // const isImportItemCommingFromJsxFile =
      //   importItemFileSource.endsWith("tsx") ||
      //   importItemFileSource.endsWith("jsx");

      // Load file content (copy and paste file content where this import item is comming from)
      // Files without source are the ones that not live in the src directory
      // const importItemFileSource = fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

      let importItemFileContent = fileSchemas.find(
        (importFileSchema) =>
          importFileSchema.filePath === importItemFileSource,
      );

      // NAO WIDGETS | MODULOS (arquivos que contenham "module" no nome): tem o conteúdo de seu arquivo copiado e colado no corpo do arquivo sendo processado atual
      if (importItemFileContent.isModule) {
        // Funcao recursiva aqui para fazer com que arquivos ainda não processados pelo injection, sejam primeiro
        if (!importItemFileContent.injectFilesDependencies_Done) {
          // Faz o processo primeiro no arquivo dependente

          // updated "importItemFileContent"
          importItemFileContent = prepareListOfInjections(
            fileSchemas,
            importItemFileContent,
          );
        }

        // Insere os arquivos dependentes que já foram inseridos no bundle. Isso evita duplicatas de conteúdo
        if (!fileSchema.toBeInjectedFiles) {
          fileSchema.toBeInjectedFiles = [];
        }
        // Deve guardar as informações da injeção da dependencial atual e as dependencias da dependencia atual

        // Adiciona somente se ainda nao tiver o item na lista
        if (
          !fileSchema.toBeInjectedFiles.includes(importItemFileContent.filePath)
        ) {
          fileSchema.toBeInjectedFiles.push(
            importItemFileContent.filePath,
            ...(importItemFileContent.toBeInjectedFiles
              ? importItemFileContent.toBeInjectedFiles
              : []),
          );
        }

        // Remove items duplicados

        // Redefine bundle atualizado
        // fileSchema.finalFileBundle = fileBundle;
      }
    }
  });

  // Sinaliza que o procsso de injecao foi finalizado neste arquivo
  fileSchema.injectFilesDependencies_Done = true;

  // Remove conteúdo duplicado
  // fileBundle = removeDuplicateInjection(fileBundle, fileSchemas, fileSchema);
  // fileSchema.finalFileBundle = fileBundle;
  // removeDuplicateInjection(fileBundle, fileSchemas, fileSchema);
  // console.log("\n");

  return fileSchema;
};

/**
 * Coloca o conteúdo dos arquivos nao .ts e .jsx de dependencia dentro do bundle de cada arquivo do schema global
 * Esse é um processo que ocorre para todos os arquivos, mas somente copia e cola o conteudo para arquivos nao JSX.
 *
 * Arquivos reconhecidos como JSX (Widgets) serão tratados de outra forma. Ver "swapComponentsForWidgets"
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], toBeInjectedFiles:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]} fileSchemas
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], toBeInjectedFiles:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const injectFilesDependencies = (fileSchemas, fileSchema) => {
  // console.log("======= File Final Bundle =========");
  // console.log(fileSchema.finalFileBundle);
  // console.log("HTML Elements:", htmlElements);
  // console.log("\n\n");
  // const pastedFiles = [];
  let fileBundle = fileSchema.finalFileBundle;

  // Se nao tiver nada a ser injetado, somente retorna o file Schema sem alterações
  if (!fileSchema.toBeInjectedFiles) {
    return fileSchema;
  }

  const injectedFiles = fileSchema.injectedFiles || [];

  // Checa se o item faz parte de componentes
  fileSchema.toBeInjectedFiles.forEach((fileItemPath) => {
    // Se ja o arquivo ja tiver sido injetado, ignora
    if (injectedFiles.includes(fileItemPath)) {
      return;
    }

    // Se for item não widget, inclui no topo do bundle do arquivo

    // Pega o esquema do arquivo
    let fileItemSchema = fileSchemas.find(
      (importFileSchema) => importFileSchema.filePath === fileItemPath,
    );

    fileBundle = `
          ${fileItemSchema.jsContent}
          ${fileBundle}
          `;

    injectedFiles.push(fileItemPath);
    fileSchema.finalFileBundle = fileBundle;
    fileSchema.injectedFiles = injectedFiles;
  });

  return fileSchema;
};

/**
 * Caso tenha dependencias do Alem (inportable items), prepara eles para serem injetados.
 *
 * Remove os elementos da chave em que está e coloca em uma nova linha contendo seu caminho
 * até a lib alem-vm/importable/item...
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const prepareAlemDependencies = (fileSchema) => {
  const importItems = getFileImportsElements(fileSchema.content);

  // console.log("BRO FILE:", fileSchema.filePath);
  // console.log("BRO ITEMS:", importItems);

  let fileContent = fileSchema.content;
  let contentChanged = false;

  importItems.forEach((item) => {
    // TODO: [Alem items: Routes, Link, etc] Checar se esta dando conflito com items do projeto

    const importStatementFileSource = getImportedElementFileSource(
      fileContent,
      item,
    );

    // Se o item estiver vindo de um destino que contenha "alem-vm" ou "alem"
    // logo é um item do Além.
    if (
      /\balem-vm\b/.test(importStatementFileSource) ||
      /\balem\b/.test(importStatementFileSource)
    ) {
      const alemImportElement = importableFiles[item];
      // console.log(`Is ${item} from Alem Import?:`, !!alemImportElement);

      // Se for um elemento importavel do Além e estiver presente no importableFiles do Além, então
      // insere a nova linha no arquivo pedindo para importar o elemento.
      if (alemImportElement) {
        contentChanged = true;

        fileContent = transformImports(fileContent, item, alemImportElement);

        //         fileContent = `import { ${item} } from '${alemImportElement}';
        // ${fileContent}
        //       `;
      }
    }
  });

  if (contentChanged) {
    fileSchema.content = fileContent;
  }

  return fileSchema;
};

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @param {*} additionalFileSchemas FileSchemas to be added to the list of main fileSchemas. It's going to be added first before
 * the process starts. This is util to inject previous schema files like Além importable items.
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]}
 */
const transformSchemaToWidget = (fileSchemas, additionalFileSchemas) => {
  // TODO: trocar esse nome, transformSchemaToWidget -> transformSchemaToWidgetSchema

  // Tag alem files (INFO: Isso não está servindo pra nada atualmente)
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    const isAlemImportableFile = fileSchema.filePath.includes(
      "lib/alem-vm/importable/",
    );
    // console.log("TAG:", fileSchema.filePath, isAlemImportableFile);
    fileSchema.isAlemFile = isAlemImportableFile;
    fileSchemas[fileSchemaIndex] = fileSchema;
  });

  // Caso tenha dependencias do Alem (inportable items), prepara eles para serem injetados
  // Remove os elementos da chave em que está e coloca em uma nova linha contendo seu caminho
  // até a lib alem-vm/importable/item...
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = prepareAlemDependencies(fileSchema);
  });

  // Adiciona schemas já processados dos items importáveis do Além (hahaha)
  if (additionalFileSchemas) {
    fileSchemas = [...additionalFileSchemas, ...fileSchemas];
  }

  // Gera o primeiro finalFileBundle e widgetName(para Widgets somente), parametros e imports
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = processSchema(fileSchema);
  });

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que contenham elementos html mas são stateless
    fileSchemas[fileSchemaIndex] = swapComponentsForStatelessFiles(
      fileSchemas,
      fileSchema,
    );
  });

  // Prepara lista de arquivos a serem injetados dentro de cada arquivo
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = prepareListOfInjections(
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

  // Faz transformação de async/await para o formato promisify
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchema.finalFileBundle = transformAsyncAwait(
      fileSchema.finalFileBundle,
    );
    fileSchemas[fileSchemaIndex] = fileSchema;
  });

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
