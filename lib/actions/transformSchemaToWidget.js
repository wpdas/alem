const { parse } = require("node-html-parser");
const {
  getFileImportsElements,
  getFileComponents,
  getComponentName,
  getComponentParams,
  removeLineFromText,
  removeLastLineFromText,
  // extractHtmlElements,
  // getHtmlElementProps,
  getHtmlElementName,
  getImportedElementFileSource,
  getFilePathBasedOnParentAndChildFilePath,
  convertObjectToArray,
  scapeBacktick,
  // getHtmlElementProps,
} = require("../helpers");
const { process_file_content, removeImports } = require("../parse");
const {
  ALL_BLANK_LINES,
  FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
  MORE_THAN_ONE_SPACE,
  SPACES,
  LINE_BREAKS,
} = require("../regexp");
const { log } = require("../utils");
const PROHIBITED_METHODS = require("../config/prohibitedMethods");
const hasWidgetPropsCheck = require("./hasWidgetPropsCheck");
const removeDuplicateInjection = require("./removeDuplicateInjection");
const importableFiles = require("../config/importableFiles");
const extractPropsFromJSX = require("../parsers/extractPropsFromJSX");
const extractJSXElements = require("../parsers/extractJSXElements");
const extractJSX = require("../parsers/extractJSX");
const replaceJSXElement = require("../parsers/replaceJSXElement");

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
  if (isJsxFile) {
    const componentParams = getComponentParams(jsContent);
    fileSchema.componentParamsItems = componentParams.filter(
      (item) => item !== "props",
    );
  }

  // Pega e registra o diretório do arquivo de cada dependencia/imported item
  const componentImportItems = {};
  // console.log("Imported Item for", fileSchema.filePath);
  // console.log("\n\n");
  componentImports.forEach((importedItem) => {
    // console.log("Item:", importedItem);
    let importedItemFileSource = getImportedElementFileSource(
      fileSchema.content,
      importedItem,
    );
    // console.log("Item - file Source::", importedItemFileSource);
    // console.log("Item source:", importedItemFileSource);

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
    // } else {
    //   importedItemFileSource = alemImportedItemFileSource;
    // }

    // importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
    //   fileSchema.filePath,
    //   importedItemFileSource,
    // );

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
  fileSchema.jsContent = jsContent;

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
  // const htmlElements = extractHtmlElements(fileSchema.finalFileBundle);
  // console.log("A:", htmlElements);

  console.log("\n");
  console.log("======= INICIO ======");
  console.log("File:", fileSchema.filePath);
  console.log("FILE BUNDLE:", fileSchema.pureJsContent);

  const jsxOnly = extractJSX(fileSchema.pureJsContent).join("\n");
  // Embrulha os elementos JSX em um fragmento. Se nao fizer isso
  // quebra porque seram elementos sem fragmento fechando eles
  const fixedJsxOnly = `<>\n${jsxOnly}\n</>`;

  console.log("\n");
  console.log("JSX ONLY:", fixedJsxOnly);
  console.log("\n");

  const htmlElements = extractJSXElements(fixedJsxOnly);

  // console.log("\n");
  // console.log("======= INICIO ======");
  // console.log("File:", fileSchema.filePath);
  // console.log("\n");
  // console.log("JSX ONLY:", fixedJsxOnly);
  // console.log("\n");
  // console.log("JSX ONLY:", jsxOnly);
  console.log("HTML ELMENTS:", htmlElements);

  let htmlElementProps = {};
  htmlElements.forEach((elementHtml) => {
    const elementName = getHtmlElementName(elementHtml);
    const elementProps = extractPropsFromJSX(elementHtml);
    // const elementProps2 = getHtmlElementProps(elementHtml);

    // console.log("Element HTML:", elementHtml);
    console.log("Element HTML:", elementHtml);
    console.log("Element Name:", elementName);
    console.log("Element Props:", elementProps);
    // console.log("Element Props 2:", elementProps2);
    // console.log("\n");

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
  console.log(
    "CUR PROPS:",
    htmlElementProps,
    Object.keys(htmlElementProps).length,
  );
  console.log("\n");

  Object.keys(htmlElementProps).forEach((elementKeyName) => {
    // Define o children de cada elemento baseado no seu indice

    console.log("A");
    const elements = root.getElementsByTagName(elementKeyName);
    // console.log("ELEMENTS:", elements);

    console.log("B");
    // const elements2 = extractJSXElements(fixedJsxOnly, elementKeyName);
    // console.log("ELEMENTS:", elements2);

    // Registra o children de cada elemento (elementKeyName) achado
    elements.forEach((element, elementIndex) => {
      // console.log("INICIA - C");
      const childrenContent = element.childNodes
        .join("")
        .replaceAll(MORE_THAN_ONE_SPACE, "");

      // console.log(element.childNodes);

      console.log(
        "CHECK APPLY PROPS:",
        elementKeyName,
        elementIndex,
        htmlElementProps[elementKeyName][elementIndex],
      );

      // if (htmlElementProps[elementKeyName][elementIndex]) {
      htmlElementProps[elementKeyName][elementIndex].props = {
        ...htmlElementProps[elementKeyName][elementIndex].props,
        ...(childrenContent
          ? { children: `"${scapeBacktick(childrenContent)}"` }
          : {}),
      };

      console.log("C");
      // }
    });
  });

  // Seta os valores
  fileSchema.htmlElementsProps = htmlElementProps;

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
        const rootHTML = parse(fileBundle, {});

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

            console.log("=========== AQUI?!!!!");
            const jsxOnly = extractJSX(fileSchema.content).join("\n");

            const componentElements = extractJSXElements(
              jsxOnly,
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

              const childProps = extractPropsFromJSX(htmlElementString);

              // console.log("======= TESTE DO MALACDO PROPS =======");
              // console.log(div);
              // console.log(childProps);
              // console.log(htmlElementString);
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

      // const isModule = importItemFilePath.includes(".module.");

      // Load file content (copy and paste file content where this import item is comming from)
      // Files without source are the ones that not live in the src directory
      const importItemFileSource = fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

      let importItemFileContent = fileSchemas.find(
        (importFileSchema) =>
          importFileSchema.filePath === importItemFileSource,
      );

      // console.log("É um componente/Widget?", isImportItemCommingFromJsxFile);
      // NAO WIDGETS | MODULOS (arquivos que contenham "module" no nome): tem o conteúdo de seu arquivo copiado e colado no corpo do arquivo sendo processado atual
      // if (!isImportItemCommingFromJsxFile || importItemFileContent.isModule) {
      if (importItemFileContent.isModule) {
        // // Load file content (copy and paste file content where this import item is comming from)
        // // Files without source are the ones that not live in the src directory
        // const importItemFileSource =
        //   fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

        if (importItemFileSource) {
          // Funcao recursiva aqui para fazer com que arquivos ainda não processados pelo injection, sejam primeiro
          if (!importItemFileContent.injectFilesDependencies_Done) {
            // Faz o processo primeiro no arquivo dependente

            // updated "importItemFileContent"
            importItemFileContent = injectFilesDependencies(
              fileSchemas,
              importItemFileContent,
            );
          }

          const itemBundle = importItemFileContent.finalFileBundle;

          fileBundle = `
          ${itemBundle}

          ${fileBundle}
          `;

          // Sinaliza que o procsso de injecao foi finalizado neste arquivo
          fileSchema.injectFilesDependencies_Done = true;

          // Insere os arquivos dependentes que já foram inseridos no bundle. Isso evita duplicatas de conteúdo
          if (!fileSchema.injectedFiles) {
            fileSchema.injectedFiles = [];
          }
          // Deve guardar as informações da injeção da dependencial atual e as dependencias da dependencia atual

          fileSchema.injectedFiles.push(
            importItemFileContent.filePath,
            ...(importItemFileContent.injectedFiles
              ? importItemFileContent.injectedFiles
              : []),
          );

          // Redefine bundle atualizado
          fileSchema.finalFileBundle = fileBundle;
        }
      }
    }
  });

  // Remove conteúdo duplicado
  // fileBundle = removeDuplicateInjection(fileBundle, fileSchemas, fileSchema);
  // fileSchema.finalFileBundle = fileBundle;
  // removeDuplicateInjection(fileBundle, fileSchemas, fileSchema);

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

  let fileContent = fileSchema.content;
  let contentChanged = false;

  // console.log("\n\n");
  // console.log("Imports Elements to ", fileSchema.filePath, importItems);
  importItems.forEach((item) => {
    // TODO: [Alem items: Routes, Link, etc] Checar se esta dando conflito com items do projeto
    // console.log(
    //   "[Alem items: Routes, Link, etc] Checar se esta dando conflito com items do projeto",
    // );

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

        fileContent = `import { ${item} } from '${alemImportElement}';
${fileContent}
      `;
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

  // Adiciona os dados de cada elemento HTML no schema de cada arquivo
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que tenham conteúdo Widget apenas
    if (fileSchema.widgetName) {
      fileSchemas[fileSchemaIndex] = populateHtmlElementsProps(fileSchema);
    }
  });

  console.log("FUNDA A -------------------------");

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Processa arquivos que contenham elementos html mas são stateless
    fileSchemas[fileSchemaIndex] = swapComponentsForStatelessFiles(
      fileSchemas,
      fileSchema,
    );
  });

  console.log("FUNDA B");

  // Copia e cola o conteúdo de arquivos não .tsx | .jsx para dentro dos arquivos que dependem deles
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = injectFilesDependencies(
      fileSchemas,
      fileSchema,
    );
  });

  // Remove conteúdo duplicado
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchema.finalFileBundle = removeDuplicateInjection(
      fileSchema.finalFileBundle,
      fileSchemas,
      fileSchema,
    );

    // Remove duplicates from injected files items (the removeDuplicateInjection is handling it)
    if (fileSchema.injectedFiles) {
      fileSchema.injectedFiles = fileSchema.injectedFiles.filter(
        (item) =>
          fileSchema.injectedFiles.filter((filterItem) => filterItem === item)
            .length === 1,
      );
    }

    fileSchemas[fileSchemaIndex] = fileSchema;
  });

  return fileSchemas;
};

module.exports = transformSchemaToWidget;
