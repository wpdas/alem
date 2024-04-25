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
  getFilePathWithType,
  removeDuplicatedValuesFromArray,
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
const compilerOptions = require("./compilerOptions");
const {
  extractTopLevelDeclarations,
  processDeclarations,
} = require("../parsers/extractTopLevelDeclarations");
const transformVariableInCode = require("../parsers/transformVariableInCode");

let processError = null;

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

  // Verifica se é o arquivo principal index.tsx | index.jsx
  const isIndex =
    // OSX, Linux
    fileSchema.filePath.includes("src/index.tsx") ||
    fileSchema.filePath.includes("src/index.jsx") ||
    // Windows
    fileSchema.filePath.includes("src\\index.tsx") ||
    fileSchema.filePath.includes("src\\index.jsx");

  // isStateless = Arquivo sem controle de estado
  let isStateless = !hasWidgetPropsCheck(fileSchema.content) && !isIndex;
  fileSchema.isStateless = isStateless;

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

  // isModule = Arquivos que estão na pasta "src/modules". Estes são inseridos no state global para serem acessados por todos
  // os componentes, salvando assim bastante espaço do bundle final.
  const isModule = fileSchema.filePath.includes("src/modules/");
  fileSchema.isModule = isModule;
  if (isModule) {
    fileSchema.moduleProps = {
      name: fileSchema.filePath,
      values: extractTopLevelDeclarations(
        fileSchema.pureJsContent,
        fileSchema.filePath,
      ),
    };
  }

  // ITEM 1
  let componentImports = getFileImportsElements(jsContent);
  componentImports = removeProhibitedMethods(componentImports);

  // Remove imports (isso foi inibido no process_file_content no terceiro parametro)
  jsContent = removeImports(jsContent).replaceAll(ALL_BLANK_LINES, ""); // remove linhas em branco;

  // ITEM 3.2

  // remove qualquer propriedade "props", ja que vai ser inclusa automaticamente
  // componentImports = componentImports.filter((item) => item !== "props");
  // Já esta sendo feito pelo "removeProhibitedMethods"

  // Pega e registra o diretório do arquivo de cada dependencia/imported item
  const componentImportItems = {};

  componentImports.forEach((importedItem) => {
    let importedItemFileSource = getImportedElementFileSource(
      fileSchema.content,
      importedItem,
    );

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
    const isAlemFile =
      importedItemFileSource.includes(
        "lib/alem-vm/importable", // OSX, Linux
      ) ||
      importedItemFileSource.includes(
        "lib\\alem-vm\\importable", // Windows
      );

    // 2 - Se não for, continua o processo normalmente, se for, ignora o tratamento abaixo
    if (!isAlemFile) {
      // Check if its has path alias
      if (compilerOptions.hasPathAlias(importedItemFileSource)) {
        importedItemFileSource = compilerOptions.replacePathAlias(
          importedItemFileSource,
        );

        // Set the final type file (.js / .ts / .jsx / .tsx)
        importedItemFileSource = getFilePathWithType(importedItemFileSource);
      } else {
        importedItemFileSource = getFilePathBasedOnParentAndChildFilePath(
          fileSchema.filePath,
          importedItemFileSource,
        );
      }
    }

    componentImportItems[importedItem] = importedItemFileSource;
  });

  fileSchema.componentImportItems = componentImportItems;

  // Se nao for um JSX, processa o arquivo de forma normal
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

  // SUPPORT FOR IMMEDIATE FUNCTION RETURNING ELEMENT - PART 1
  // Se a primeira linha do arquivo contiver elementos html, entao nao precisa processar
  // já que se trata de um arquivo stateless simples
  // ex: const ShareIcon = () => <span className="material-symbols-outlined">share</span>;
  if (
    (getFirstLineContent(jsContent).includes("<") ||
      getFirstLineContent(jsContent).endsWith("(")) &&
    !isStateless
  ) {
    // Aqui eu uso o conteúdo original bruto mesmo. O parser consegue dividir os elementos
    // o elemento [0] vai ser o inicio da funcao
    // o elemento [1] vai ser o corpo inteiro a partir do primeiro nó dos elementos html
    const htmlParsedFile = parse(fileSchema.content);
    jsContent = htmlParsedFile.childNodes[1].toString();
    // TODO: Verificar outra forma de fazer as duas linhas acima e remover o "node-html-parser"

    // Encobre o conteúdo com um return
    jsContent = `
    return (
      ${jsContent}
    )
    `;

    // FINAL: para arquivos JSX stateless simples no formato do ex.
    fileSchema.finalFileBundle = jsContent;
    fileSchema.jsContent = jsContent;
    return fileSchema;
  }

  // Módulos (arquivos stateles) não devem ter seu conteúdo modificado
  if (!isStateless) {
    // Remove os parametros da função
    jsContent = removeFunctionParams(jsContent);
  }

  // Módulos devem ter seu jsContent inteiro, sem remover ou alterar sua estrutura.
  // Isso é porque eles são helpers que retornam JSX. Arquivos que não lidam com JSX
  // também podem ser módulos
  if (!isStateless) {
    // ITEM 4 (remover primeira linha)
    jsContent = removeLineFromText(jsContent, 1);

    // ITEM 5 (remover ultima linha)
    jsContent = removeLastLineFromText(jsContent);
  }

  // Items do Componente
  if (isJsxFile) {
    fileSchema.componentComponentItems = getFileComponents(fileSchema.content);
  } else {
    fileSchema.componentComponentItems = [];
  }

  // ITEM 6
  // ATENCAO: esta copiando tipos de props tbm do typescript

  if (!isStateless) {
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
  let fileBundle = fileSchema.jsContent;

  Object.keys(fileSchema.componentImportItems).forEach((importItem) => {
    // Se for um arquivo disponível, segue (null quer dizer que é um import de alguma lib nao local no src)
    const importItemFilePath = fileSchema.componentImportItems[importItem];
    // Nao deve processar (copiar e colar) o conteúdo do arquivo mais de uma vez
    if (importItemFilePath && !pastedFiles.includes(importItemFilePath)) {
      // Adiciona na lista de items ja processados
      pastedFiles.push(importItemFilePath);

      // INFO: Verifica se o caminho do arquivo a ser processado não é "null"
      const importItemFileSource = fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

      // Le o nome do Widget dependente (usando o fileSchema dele)
      let importItemWidget = fileSchemas.find(
        (importFileSchema) =>
          importFileSchema.filePath === importItemFileSource,
      );

      // MODULOS - INICIO
      // NEW - Armazena os módulos para serem inseridos apenas no final, assim garantindo
      // que sua referencia ficará no topo do bundle do arquivo/code final
      const updatedToBeInjectedModules = fileSchema.toBeInjectedModules || [];
      const itemToBeInjectedModules =
        importItemWidget.toBeInjectedModules || [];
      fileSchema.toBeInjectedModules = [
        ...updatedToBeInjectedModules,
        ...itemToBeInjectedModules,
      ];
      // MODULOS - FIM

      // Is import item comming from JSX | TSX file?
      const isImportItemCommingFromJsxFile =
        importItemFilePath.endsWith("tsx") ||
        importItemFilePath.endsWith("jsx");

      if (isImportItemCommingFromJsxFile) {
        // https://www.npmjs.com/package/node-html-parser#global-methods
        // const rootHTML = parse(fileBundle, {});

        // Files without source are the ones that not live in the src directory

        // // INFO: Verifica se o caminho do arquivo a ser processado não é "null"
        // const importItemFileSource =
        //   fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

        // Se existir o conteúdo localmente... segue...
        if (importItemFileSource) {
          // NOTE: Aqui que a magica acontece!!!!

          // // Le o nome do Widget dependente (usando o fileSchema dele)
          // let importItemWidget = fileSchemas.find(
          //   (importFileSchema) =>
          //     importFileSchema.filePath === importItemFileSource,
          // );

          // // MODULOS - INICIO
          // // NEW - Armazena os módulos para serem inseridos apenas no final, assim garantindo
          // // que sua referencia ficará no topo do bundle do arquivo/code final
          // const updatedToBeInjectedModules =
          //   fileSchema.toBeInjectedModules || [];
          // const itemToBeInjectedModules =
          //   importItemWidget.toBeInjectedModules || [];
          // fileSchema.toBeInjectedModules = [
          //   ...updatedToBeInjectedModules,
          //   ...itemToBeInjectedModules,
          // ];
          // // MODULOS - FIM

          const importItemWidgetComponentName =
            importItemWidget.widgetName ||
            getComponentName(importItemWidget.finalFileBundle);

          if (importItemWidgetComponentName && !importItemWidget.isStateless) {
            // Processa todos os componentes filhos
            // Cada elemento do mesmo tipo é um filho diferente que foi adicionado ao elemento pai
            // const importItemElements =
            //   fileSchema.htmlElementsProps[importItemWidgetComponentName] || [];

            // Usa o rootHTML (conteúdo html do componente) para pegar a lista de Componentes do tipo desejado. ex: Title
            // const componentElements = rootHTML.getElementsByTagName(
            //   importItemWidgetComponentName,
            // );
            // INFO: Esses comentarios acima creio que podem ser apagados, verificar
            // se ainda estou usando o modulo html parse

            const jsxOnly = extractJSX(fileSchema.content);

            const fixedJsxOnly =
              jsxOnly.length > 1
                ? `<>${jsxOnly.join("\n")}</>`
                : jsxOnly.join("\n");

            const componentElements = extractJSXElements(
              fixedJsxOnly,
              importItemWidgetComponentName,
            );

            // Seta qualquer erro se tiver
            if (!processError && componentElements.error) {
              processError = `${fileSchema.filePath}: ${componentElements.error}`;
            }
            if (processError) return;

            // Transfor cada componente em Widget com suas propriedades
            componentElements.elements.forEach((div, divIndex) => {
              const htmlElementString = componentElements.elements[divIndex]
                .toString()
                .replaceAll(LINE_BREAKS, "")
                .replaceAll(MORE_THAN_ONE_SPACE, " ");

              const extractPropsResult = extractPropsFromJSX(htmlElementString);
              let childProps = extractPropsResult.keyValueProps;

              const childSpreads = extractPropsResult.spreads;

              // get the children
              let childChildren = extractJSXChildren(htmlElementString);
              if (childChildren) {
                childChildren = processChildrenWidget(
                  childChildren,
                  fileSchemas,
                );
                childProps = { ...childProps, children: childChildren };
              }

              let importItemPropsStringSequence =
                convertObjectToArray(childProps).join(",");

              // Adiciona os spreads junto com as propriedades do elemento JSX. Ex:
              // <Widget code="..." {...{foo: 2, bar: "oi", ...mySpread1, ...mySpread2}}
              // no caso os spreads sao: ...mySpread1 e ...mySpread2
              if (childSpreads.length > 0) {
                importItemPropsStringSequence += `${importItemPropsStringSequence.length > 0 ? "," : ""} ${childSpreads.join(",")}`;
              }

              // Babel segue os padroes JS, por isso:
              // 1 - Adiciona uma uma função no topo
              // 2 - Fecha a função no final
              fileBundle = `const TempMethod = () => {\n${fileBundle}\n}`;
              // NOTE: nao adicionando a ultima linha, mas estou removendo a ultima linha
              // Caso quebre, ver isso. [Provavelmente o escape acima esta adicionando o } no final]

              // Transform components generated by .jsx / .tsx into <Widget code={code} .../>
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
          }

          // Altera o jsContent com os Widgets
          fileSchema.jsContent = fileBundle;
          // Altera o finalBundle que é usado posteriormente
          fileSchema.finalFileBundle = fileBundle;
        }
      }
    }
  });

  // Remove duplicate modules ref
  if (fileSchema.toBeInjectedModules) {
    fileSchema.toBeInjectedModules = removeDuplicatedValuesFromArray(
      fileSchema.toBeInjectedModules,
    );
  }

  return fileSchema;
};

const prepareListOfModulesToInject = (fileSchemas, fileSchema) => {
  const pastedFiles = [];

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

      // Import File Schema
      let importItemFileContent = fileSchemas.find(
        (importFileSchema) =>
          importFileSchema.filePath === importItemFileSource,
      );

      // Também não pode ser um módulo
      if (importItemFileContent.isStateless && importItemFileContent.isModule) {
        // Modulos

        // Insere os modulos dependentes
        if (!fileSchema.toBeInjectedModules) {
          fileSchema.toBeInjectedModules = [];
        }

        // Adiciona somente se ainda nao tiver o item na lista de modulos
        if (
          !fileSchema.toBeInjectedModules.includes(
            importItemFileContent.filePath,
          )
        ) {
          fileSchema.toBeInjectedModules.push(
            importItemFileContent.filePath,
            ...(importItemFileContent.toBeInjectedModules
              ? importItemFileContent.toBeInjectedModules
              : []),
          );
        }
      }
    }
  });

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
  const pastedFiles = [];

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

      // Load file content (copy and paste file content where this import item is comming from)
      // Files without source are the ones that not live in the src directory
      // const importItemFileSource = fileSchema.componentImportItems[importItem]; // src/path/to/file.tsx | null

      let importItemFileContent = fileSchemas.find(
        (importFileSchema) =>
          importFileSchema.filePath === importItemFileSource,
      );

      // TODO: Porque tem uma funcao para injecao de dependencias apenas de arquivos stateless?
      // NAO WIDGETS | MODULOS (arquivos que contenham "module" no nome): tem o conteúdo de seu arquivo copiado e colado no corpo do arquivo sendo processado atual
      // Também não pode ser um módulo
      if (importItemFileContent.isStateless) {
        // Funcao recursiva aqui para fazer com que arquivos ainda não processados pelo injection, sejam primeiro
        if (!importItemFileContent.injectFilesDependencies_Done) {
          // Faz o processo primeiro no arquivo dependente

          // updated "importItemFileContent"
          importItemFileContent = prepareListOfInjections(
            fileSchemas,
            importItemFileContent,
          );
        }

        // if (importItemFileContent.isModule) {
        //   // Modulos

        //   // Insere os modulos dependentes
        //   if (!fileSchema.toBeInjectedModules) {
        //     fileSchema.toBeInjectedModules = [];
        //   }

        //   // Adiciona somente se ainda nao tiver o item na lista de modulos
        //   if (
        //     !fileSchema.toBeInjectedModules.includes(
        //       importItemFileContent.filePath,
        //     )
        //   ) {
        //     fileSchema.toBeInjectedModules.push(
        //       importItemFileContent.filePath,
        //       ...(importItemFileContent.toBeInjectedModules
        //         ? importItemFileContent.toBeInjectedModules
        //         : []),
        //     );
        //   }
        // }
        // else {
        //  // Nao modulos

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
        // }
      }
    }
  });

  // Sinaliza que o procsso de injecao foi finalizado neste arquivo
  fileSchema.injectFilesDependencies_Done = true;

  return fileSchema;
};

const foo = (fileSchemas, fileSchema) => {
  let fileBundle = fileSchema.finalFileBundle;

  // Se nao tiver nada a ser injetado, somente retorna o file Schema sem alterações
  if (!fileSchema.toBeInjectedModules) {
    return fileSchema;
  }

  // Checa se o item faz parte de componentes
  fileSchema.toBeInjectedModules.forEach((fileItemPath) => {
    // Pega o esquema do arquivo
    let fileItemSchema = fileSchemas.find(
      (importFileSchema) => importFileSchema.filePath === fileItemPath,
    );

    // Insere apenas as referencias das declarações do módulo
    const moduleValuesKeys = Object.keys(fileItemSchema.moduleProps.values);
    let injections = "";

    moduleValuesKeys.forEach((propKey) => {
      injections = `
           const ${propKey} = props.alem.modulesCode["${fileItemSchema.moduleProps.name}"].${propKey};
           ${injections}
           `;
    });

    fileBundle = `
           ${injections}
           ${fileBundle}
           `;

    fileSchema.finalFileBundle = fileBundle;
    fileSchema.jsContent = fileBundle;
  });

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

    // Pega o esquema do arquivo
    let fileItemSchema = fileSchemas.find(
      (importFileSchema) => importFileSchema.filePath === fileItemPath,
    );

    // if (fileItemSchema.isModule) {
    //   console.log(fileSchema.filePath, "--->", fileItemSchema.filePath);

    //   const moduleValuesKeys = Object.keys(fileItemSchema.moduleProps.values);
    //   moduleValuesKeys.forEach((propKey) => {
    //     // Deve trocar o conteúdo somente se for um conteúdo sendo importado dentro do arquivo principal
    //     const importReference = fileSchema.componentImportItems[propKey];
    //     // Existe o import no arquivo principal && o diretório do import pertence ao "fileItemSchema.filePath"?
    //     const isImported =
    //       (importReference && importReference === fileItemSchema.filePath) ||
    //       false;

    //     // console.log("IS IMPOTED:", isImported, propKey);
    //     if (isImported) {
    //       // Insere apenas a referencia da dependencia
    //       fileBundle = `
    //       const ${propKey} = props.alem.modulesCode.["${fileItemSchema.moduleProps.name}"].${propKey};
    //       ${fileBundle}
    //       `;
    //     }
    //   });
    // } else {
    //   // Injeta o conteúdo literalmente
    //   fileBundle = `
    //       ${fileItemSchema.jsContent}
    //       ${fileBundle}
    //       `;
    // }

    if (!fileItemSchema.isModule) {
      // Injeta o conteúdo literalmente
      fileBundle = `
          ${fileItemSchema.jsContent}
          ${fileBundle}
          `;

      injectedFiles.push(fileItemPath);
    }
  });

  fileSchema.finalFileBundle = fileBundle;
  fileSchema.injectedFiles = injectedFiles;

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

      // Se for um elemento importavel do Além e estiver presente no importableFiles do Além, então
      // insere a nova linha no arquivo pedindo para importar o elemento.
      if (alemImportElement) {
        contentChanged = true;

        fileContent = transformImports(fileContent, item, alemImportElement);
      }
    }
  });

  if (contentChanged) {
    fileSchema.content = fileContent;
  }

  return fileSchema;
};

// * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]}
// INFO: isso pertencia a estrutura abaixo e foi removido porque esta desatualizado

/**
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @param {*} additionalFileSchemas FileSchemas to be added to the list of main fileSchemas. It's going to be added first before
 * the process starts. This is util to inject previous schema files like Além importable items.
 */
const transformSchemaToWidget = (fileSchemas, additionalFileSchemas) => {
  // TODO: trocar esse nome, transformSchemaToWidget -> transformSchemaToWidgetSchema
  // Reset error state
  processError = null;

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
    fileSchemas[fileSchemaIndex] = prepareListOfModulesToInject(
      fileSchemas,
      fileSchema,
    );

    // if (fileSchema.filePath.includes("src/Main.tsx")) {
    //   console.log("========== AAAA");
    //   console.log("fileSchemas[fileSchemaIndex]", fileSchemas[fileSchemaIndex]);
    // }
  });

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // if (fileSchema.filePath.includes("src/Main.tsx")) {
    //   console.log("========== BBBB");
    //   console.log("fileSchemas[fileSchemaIndex]", fileSchemas[fileSchemaIndex]);
    // }
    // Processa arquivos que contenham elementos html mas são stateless
    // console.log("Current file:", fileSchema.filePath);
    // ATENCAO: essa funcao esta usando "fileSchema.jsContent" ao invéz de "fileSchema.finalFileBundle"
    // ATENÇÃO: muda tanto o "finalFileBundle" quanto o "jsContent"
    fileSchemas[fileSchemaIndex] = swapComponentsForStatelessFiles(
      fileSchemas,
      fileSchema,
    );

    // if (fileSchema.filePath.includes("src/Main.tsx")) {
    //   console.log("========== AAAA");
    //   console.log("fileSchemas[fileSchemaIndex]", fileSchemas[fileSchemaIndex]);
    // }
  });

  // Prepara lista de arquivos a serem injetados dentro de cada arquivo
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = prepareListOfInjections(
      fileSchemas,
      fileSchema,
    );

    // if (fileSchema.filePath.includes("src/Main.tsx")) {
    //   console.log("========== AAAA");
    //   console.log("fileSchemas[fileSchemaIndex]", fileSchemas[fileSchemaIndex]);
    // }
  });

  // FOO
  // fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
  //   fileSchemas[fileSchemaIndex] = foo(fileSchemas, fileSchema);
  // });

  // Copia e cola o conteúdo de arquivos não .tsx | .jsx para dentro dos arquivos que dependem deles
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = injectFilesDependencies(
      fileSchemas,
      fileSchema,
    );
  });

  // Faz transformação de async/await para o formato promisify
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Transform async/await (experimental)
    fileSchema.finalFileBundle = transformAsyncAwait(
      fileSchema.finalFileBundle,
    );
    fileSchemas[fileSchemaIndex] = fileSchema;
  });

  // FOO
  // ATENÇÃO: muda tanto o "finalFileBundle" quanto o "jsContent"
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = foo(fileSchemas, fileSchema);
    // if (fileSchema.filePath.includes("src/Main.tsx")) {
    //   console.log("========== AAAA");
    //   console.log("fileSchemas[fileSchemaIndex]", fileSchemas[fileSchemaIndex]);
    // }
  });

  // Ajusta módulos: Faz o parse de caminho das dependencias dos módulos que importam outros módulos
  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    fileSchemas[fileSchemaIndex] = parseModules(fileSchemas, fileSchema);
  });

  return { fileSchemas, processError };
};

/**
 * Faz a troca de referencia das declarações para apontarem para o props.alem.modulesCode dos outros módulos
 * @param {*} fileSchemas
 * @param {*} fileSchema
 */
const parseModules = (fileSchemas, fileSchema) => {
  // Se for um módulo && esse módulo tiver importando outros módulos...
  if (fileSchema.isModule && fileSchema.toBeInjectedModules) {
    fileSchema.toBeInjectedModules.forEach((modulePath) => {
      const moduleSchema = fileSchemas.find((m) => m.filePath === modulePath);

      const moduleSchemaItems = Object.keys(moduleSchema.moduleProps.values);
      const fileSchemaModuleItems = Object.keys(fileSchema.moduleProps.values);
      moduleSchemaItems.forEach((moduleItemKey) => {
        // 1 - Neste ponto temos uma referencia/chave do módulo importado e do modulo atual
        // 2 - Agora faz um loop para checar e tratar referencia em cada item do modulo atual (fileSchema)
        fileSchemaModuleItems.forEach((currentModuleKey) => {
          const currentModuleItemValue =
            fileSchema.moduleProps.values[currentModuleKey];
          // Se o item atual do modulo atual possuir qualquer referencia de um item do modulo sendo importando
          // aplica a mudanca de referencia
          if (currentModuleItemValue.includes(moduleItemKey)) {
            const replaced = transformVariableInCode(
              currentModuleItemValue,
              moduleItemKey,
              ":::VAR_REF:::",
            );
            // Atualiza as referencias no fileSchema (modulo) atual
            fileSchema.moduleProps.values[currentModuleKey] =
              replaced.replaceAll(
                ":::VAR_REF:::",
                `props.alem.modulesCode['${moduleSchema.moduleProps.name}'].${moduleItemKey}`,
              );
          }
        });
      });
    });
  }

  return fileSchema;
};

module.exports = transformSchemaToWidget;
