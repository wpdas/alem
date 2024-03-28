const fs = require("fs");
const path = require("path");
const regexp = require("./regexp");

// Get all elements imports. ex:
/**
   * [
      'AppBackground',
      'AppContainer',
      'Sidebar',
      'ContentView',
      'Footer',
      'Modals',
      'styled',
      'Row'
    ]
   */
const getFileImportsElements = (fileContent) => {
  const showLogs = false;
  if (showLogs) {
    console.log("==== getFileImportElements ====");
  }

  let fileImports = [];
  const foundImportItems = fileContent.match(regexp.IMPORT_STATEMENTS);

  if (foundImportItems) {
    foundImportItems.forEach((importStatement) => {
      // CAMINHO PARA PEGAR CONTEUDO ENTRE BRACES DOS IMPORTS
      const importStatementInline = importStatement
        .replaceAll(regexp.LINE_BREAKS, "")
        .replaceAll(regexp.MORE_THAN_ONE_SPACE, " ");

      if (showLogs) {
        console.log("Statement in Line:", importStatementInline);
      }

      const elementsItems = importStatementInline.match(
        // regexp.IMPORT_CONTENT_BETWEEN_BRACES,
        regexp.GET_ALL_BETWEEN_IMPORT_AND_FROM,
      );

      if (showLogs) {
        console.log("Element Items:", elementsItems);
      }

      // Processa items entre braces
      if (elementsItems) {
        const cleanedItems = elementsItems[0].replaceAll(regexp.SPACES, "");

        // ELEMENTOS ENTRE BRACES AQUI: FINAL
        const allImportElements = cleanedItems
          .split(",")
          .map((item) =>
            item.replaceAll(regexp.SPECIAL_CHARACTERS_AND_SPACES, ""),
          );

        fileImports.push(...allImportElements);

        if (showLogs) {
          console.log("Final Import Line Elements", allImportElements);
        }
      }
    });
  }

  if (showLogs) {
    console.log(
      "RESULT =================>",
      fileImports.filter((item) => item.length > 0),
    );
    console.log("\n\n");
  }

  return fileImports.filter((item) => item.length > 0);
};

/**
 * Get import statements only
 * ex:
 * import Sidebar from "./components/Sidebar";
 * import ContentView from "./components/ContentView";
 * @param {*} fileContent
 * @returns
 */
const getImportStatements = (fileContent) =>
  fileContent.match(regexp.GET_ALL_IMPORT_STATEMENT);

/**
 * Get Import's path
 * ex:
 * give: import Sidebar from "./components/Sidebar";
 * return: ./components/Sidebar
 * @param {*} fileContent
 * @returns
 */
const getImportsPath = (fileContent) => {
  // console.log("=====> Dentro do getImportsPath");
  // console.log("fileContent:", fileContent);
  let result = [];
  const importStatements = fileContent.match(regexp.GET_ALL_IMPORT_STATEMENT);

  // console.log("Get Imports Path:", importStatements);

  if (importStatements) {
    importStatements.forEach((value) =>
      value
        .match(regexp.BETWEEN_QUOTES)
        .forEach((subValue) => result.push(subValue)),
    );
  }

  return result;
};

/**
 * Given a file path, try to return the path + file type (ts, tsx, js, jsx).
 * It supports these types at the moment: ts, tsx, js, jsx
 * @param {*} filePath
 * @returns
 */
const getFilePathWithType = (filePath) => {
  if (fs.existsSync(`${filePath}.ts`)) {
    return `${filePath}.ts`;
  } else if (fs.existsSync(`${filePath}.tsx`)) {
    return `${filePath}.tsx`;
  } else if (fs.existsSync(`${filePath}.js`)) {
    return `${filePath}.js`;
  } else if (fs.existsSync(`${filePath}.jsx`)) {
    return `${filePath}.jsx`;
  } else if (fs.existsSync(`${filePath}/index.ts`)) {
    return `${filePath}/index.ts`;
  } else if (fs.existsSync(`${filePath}/index.tsx`)) {
    return `${filePath}/index.tsx`;
  } else if (fs.existsSync(`${filePath}/index.js`)) {
    return `${filePath}/index.js`;
  } else if (fs.existsSync(`${filePath}/index.jsx`)) {
    return `${filePath}/index.jsx`;
  }
  return null;
};

/**
 * Remove duplicated values from array
 * @param {[]} array
 * @returns
 */
const removeDuplicatedValuesFromArray = (array) => {
  return array.filter((item, index) => array.indexOf(item) === index);
};

const getFileComponents = (fileContent) => {
  const imports = getFileImportsElements(fileContent);

  // Pega os componentes
  // expressao: pega todo os items entre <>
  let foundItems = fileContent.match(regexp.HTML_ELEMENT);

  // Pega o nome de todos os componentes
  foundItems = foundItems
    .map(
      (item) =>
        // expressa: pega todos as palavras após o <
        item.match(regexp.FIRST_WORD_IN_THE_HTML_ELEMENT) &&
        item.match(regexp.FIRST_WORD_IN_THE_HTML_ELEMENT)[0],
    )
    .filter((item) => !!item);

  // Remove duplicados
  function removeDuplicates(array) {
    return array.filter((item, index) => array.indexOf(item) === index);
  }

  foundItems = removeDuplicates(foundItems);

  // Filtra pelos imports: apenas os items do import interessao
  foundItems = foundItems.filter((item) => imports.includes(item));

  // console.log("Found items:", foundItems);
  return foundItems;
};

/**
 * Return the item between function(function, consts, lets, vars) parenthesis. E.g.:
 * given: function (){}... get: []
 * given: function (paramA, paramB){}... get: [paramA, paramB]
 * given: function ({propA, propB}){}... get: [propA, propB]
 * @param {*} componentMethodContent
 * @returns
 */
const getFunctionItemsBetweenParenthesis = (componentMethodContent) => {
  // Varre items para ver se ja não estao inclusos na linha
  let parenthesisContent = componentMethodContent.match(
    regexp.BETWEEN_PARENTHESIS,
  )[0];
  parenthesisContent = parenthesisContent.split(",");
  parenthesisContent = parenthesisContent.map((item) =>
    item.replaceAll(regexp.SPECIAL_CHARACTERS_AND_SPACES, ""),
  );
  parenthesisContent = parenthesisContent.filter((item) => !!item);

  return parenthesisContent;
};

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
 * Get the component name
 *
 * OBS: Obtem o primeiro nome na sequencia de função, se tiver mais de um, não vai pegar
 * ATENÇÃO: Sempre que possível use o conteúdo bruto do arquivo, não o bundle processado!
 * Usar o bundle processado pode haver falhas já que em alguns momentos o método da construção é removido.
 * @param {string} fileJsContent
 */
const getComponentName = (fileJsContent) => {
  // NOTE: Solucao comentada é mais fraca por usar primeira linha do arquivo
  // fileJsContent = removeImports(fileJsContent);
  // fileJsContent = fileJsContent.replaceAll(ALL_BLANK_LINES, "");
  // const firstLineFile = getFirstLineContent(fileJsContent);
  // const componentName = firstLineFile.match(GET_SECOND_WORD)[1];
  // return componentName;

  const componentName =
    getFirstConstName(fileJsContent) ||
    getFirstLetName(fileJsContent) ||
    getFirstVarName(fileJsContent) ||
    getFirstFunctionName(fileJsContent);

  return componentName;
};

/**
 * Pega os parametros da função do componente.
 *
 * OBS: reconhece apenas uma função, a primeira no arquivo
 * @param {string} content
 */
const getComponentParams = (content) => {
  // ATENCAO: Deprecado, prefira usar o analyzeFunctionSignature
  let result = [];

  const parenthesisContent = content.match(
    regexp.FIRST_ITEMS_CONTENT_BETWEEN_PARENTHESIS,
  );

  if (parenthesisContent) {
    result = parenthesisContent[0]
      .replaceAll(regexp.LINE_BREAKS, "")
      .split(",")
      .map((item) => item.replaceAll(regexp.SPECIAL_CHARACTERS_AND_SPACES, ""))
      .filter((item) => !!item);
  }

  return result;
};

/**
 * Remove line from text
 * @param {string} text
 * @param {number} lineNumber
 * @returns
 */
function removeLineFromText(text, lineNumber) {
  const lines = text.split("\n");
  // remove selected line
  const updatedText = lines.slice(lineNumber).join("\n");
  return updatedText;
}

/**
 * Remove última linha de um texto
 * @param {string} content
 */
const removeLastLineFromText = (content) => {
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
 * Dado: <SidebarItem onItemClick={onItemClick} to={routeDetails.path} label={routeDetails.title} fakeContent="again" />
 * Retorna: { fakeContent: "\"again\"", label: "routeDetails.title", onItemClick: "onItemClick", to: "routeDetails.path" };
 * @param {string} htmlElement
 */
const getHtmlElementProps = (htmlElement) => {
  // ATENÇAO: método deprecado, usar extractPropsFromJSX
  // NOTE: versao 2 melhorada, corrigido o erro onde nao estava escapando o {} usado dentro de outro {}.
  // ex: <Elemento style={{marginTop: "2vh"}} />, antes so retornava {style: marginTop: "2vh"} o que quebrava
  // agora retorna corretamente assim {style: {marginTop: "2vh"}}
  const regex = /(\w+)\s*=\s*(?:{([^{}]*)}|("[^"]*"))/g;
  const foundProps = {};

  let match;
  while ((match = regex.exec(htmlElement)) !== null) {
    const propertyName = match[1];
    const bracesValue = match[2];
    const quotationValue = match[3];

    if (bracesValue !== undefined) {
      foundProps[propertyName] = bracesValue;
    } else if (quotationValue !== undefined) {
      foundProps[propertyName] = quotationValue;
    }
  }

  const regex2 = /(\w+)\s*=\s*{{([^{}]+)}}/g;
  let foundPropsInBraces;

  while ((foundPropsInBraces = regex2.exec(htmlElement)) !== null) {
    const propertyName = foundPropsInBraces[1];
    const propertyValue = `{${foundPropsInBraces[2].trim()}}`; // Adiciona as chaves ao valor
    foundProps[propertyName] = propertyValue;
  }

  return foundProps;
};
// const getHtmlElementProps = (htmlElement) => {
//   // Regex para capturar as propriedades
//   // Regex to get properties
//   const regex = /(\w+)\s*=\s*(?:{([^{}]*)}|("[^"]*"))/g;

//   // Objeto para armazenar as propriedades extraídas
//   // Object to store the properties
//   const foundProps = {};

//   // Executar a regex para encontrar todas as correspondências
//   // Execute regex to find all the matches
//   let match;
//   while ((match = regex.exec(htmlElement)) !== null) {
//     // O primeiro grupo capturado é o nome da propriedade
//     const propertieName = match[1];
//     // O segundo grupo capturado é o valor entre chaves {}
//     const bracesValue = match[2];
//     // O terceiro grupo capturado é o valor entre aspas ""
//     const quotationValue = match[3];

//     // Definir o valor da propriedade no objeto resultante
//     if (bracesValue !== undefined) {
//       foundProps[propertieName] = bracesValue;
//     } else if (quotationValue !== undefined) {
//       foundProps[propertieName] = quotationValue;
//     }
//   }

//   // Segunda parte da busca, PEGA TODOS AS PROPRIEDADES ENTRE {{ }}
//   // Dado: <div style={{ marginTop: "calc(-1 * var(--body-top-padding, 0))" }} bati="texto">
//   // Retorna: {style: "marginTop: \"calc(-1 * var(--body-top-padding, 0))\""}
//   const regex2 = /(\w+)\s*=\s*{{([^{}]+)}}/g;

//   let foundPropsInBraces;

//   while ((foundPropsInBraces = regex2.exec(htmlElement)) !== null) {
//     const propertieName = foundPropsInBraces[1];
//     const propertieValue = foundPropsInBraces[2].trim();
//     foundProps[propertieName] = propertieValue;
//   }

//   return foundProps;
// };

/**
 * Extrai elementos html do texto
 *
 * Dado:
 *
 * <Banner>
 *  Alem is currently on version <span>{currentVersion}</span>.
 * </Banner>
 * <Watcher />
 * <Title bold={true} label="diga oi">Algo titulo</Title>
 *
 * Retorna: ["<Banner>", "<span>", "</span>", "</Banner>", "<Watcher />", "<Title bold={true} label=\"diga oi\">", "</Title>"]
 *
 * @param {string} texto
 * @returns
 */
function extractHtmlElements(htmlText) {
  // ATENÇAO: funcao deprecada. Prefira usar extractJSX e extractJSXElements
  // Regex para encontrar elementos HTML
  const regex = /<[^<>]+>/g;

  // Executar a regex para encontrar todos os elementos HTML no texto
  let elements = htmlText.match(regex) || [];
  elements = elements.map((item) =>
    item
      .replaceAll(regexp.LINE_BREAKS, " ")
      .replaceAll(regexp.MORE_THAN_ONE_SPACE, " "),
  );

  return elements;
}

/**
 * Extrai elementos html completos do texto
 *
 * Dado:
 *
 * <Banner>
 *  Alem is currently on version <span>{currentVersion}</span>.
 * </Banner>
 * <Watcher />
 * <Title bold={true} label="diga oi">Algo titulo</Title>
 *
 * Retorna: ["<Banner>Alem is currently on version <span>{currentVersion}</span></Banner>", " <span>{currentVersion}</span>", "<Watcher />", "<Title bold={true} label="diga oi">Algo titulo</Title>"]
 *
 * @param {string} htmlText
 * @returns
 */
function extractHtmlCompleteElements(htmlText) {
  const regex = /<[^>]*>.*?<\/[^>]*>/gs;
  const elements = htmlText.match(regex) || [];
  return elements;
}

/**
 * Retorna o nome do elemento html.
 *
 * Dado: <Title bold={true} label="diga oi">Algo titulo</Title>
 *
 * Retorna: "Title"
 *
 * @param {string} htmlElement
 * @returns
 */
function getHtmlElementName(htmlElement) {
  // Regex para encontrar o nome do elemento HTML
  const regex = /<([^\s/>]+)/;

  // Executar a regex para encontrar o nome do elemento HTML no texto
  const itemsFound = htmlElement.match(regex);

  if (itemsFound && itemsFound.length > 1) {
    return itemsFound[1];
  } else {
    return null; // Retorna null se o nome do elemento não for encontrado
  }
}

/**
 * Captura o children de todos os elementos que combinam com a procura.
 * Ex:
 *
 * Dado: <><Banner propriedade1="foo" propriedade2="bar">elementos que quero pegar <bagulho louco></Banner><Banner>ola</Banner><>
 *
 * Recebe: ["elementos que quero pegar <bagulho louco>", "ola"]
 * @param {string} htmlElement
 * @param {string} elementName Nome do elemento da qual o children vai ser extraído
 * @returns {string[]} foundItems
 */
function getHtmlElementChildren(htmlElement, elementName) {
  // const regex = /<[^>]*>(.*?)<\/[^>]*>/g;
  const regex = new RegExp(
    `<${elementName}[^>]*>(.*?)<\\/${elementName}>`,
    "gs",
  );
  const foundItems = [];
  let foundItem;

  while ((foundItem = regex.exec(htmlElement)) !== null) {
    foundItems.push(foundItem[1].replaceAll(regexp.MORE_THAN_ONE_SPACE, ""));
  }

  return foundItems;
}

/**
 * Retorna o caminho do arquivo da qual um elemento está sendo importado.
 *
 * Dado:
 *  - filecontent: import { loadExternalStyles } from "../components/alem"; import { outro } from "../components/outro" ... <resto de html>
 *  - importedElementName: "loadExternalStyles"
 *
 * Retorna: "../components/alem"
 *
 * @param {string} fileContent
 * @param {string} importedElementName
 * @returns
 */
function getImportedElementFileSource(fileContent, importedElementName) {
  //v3
  // Expressão regular para extrair todos os imports
  const importRegex = /import\s+.*?from\s+["'](.*?)["']/gs; // Modificador 's' permite que '.' inclua quebras de linha
  let match;
  let appContainerImportPath = null;

  // Loop sobre todos os imports encontrados
  while ((match = importRegex.exec(fileContent)) !== null) {
    // Verifica se o import inclui o 'importedElementName' (ex: Spinner) como uma palavra completa
    const importStatement = match[0];
    const regex = new RegExp(`\\b${importedElementName}\\b`);
    if (regex.test(importStatement)) {
      appContainerImportPath = match[1];
      break; // Parar de procurar após encontrar o import do 'importedElementName' (ex: Spinner)
    }
  }

  return appContainerImportPath;
}

// function getImportedElementFileSource(fileContent, importedElementName) {
//   // v2
//   // Expressão regular para extrair todos os imports
//   const importRegex = /import\s+.*?from\s+["'](.*?)["']/g;
//   let match;
//   let spinnerImportPath = null;

//   // Loop sobre todos os imports encontrados
//   while ((match = importRegex.exec(fileContent)) !== null) {
//     // Verifica se o import inclui o 'importedElementName' (ex: Spinner) como uma palavra completa
//     const importStatement = match[0];
//     const regex = new RegExp(`\\b${importedElementName}\\b`);
//     if (regex.test(importStatement)) {
//       spinnerImportPath = match[1];
//       break; // Parar de procurar após encontrar o import do 'importedElementName' (ex: Spinner)
//     }
//   }

//   return spinnerImportPath;
// }

// function getImportedElementFileSource(fileContent, importedElementName) {
//   // Verificar se o texto contém "loadExternalStyles"
//   const indexLoadExternalStyles = fileContent.indexOf(importedElementName);

//   // Verificar se foi encontrado "loadExternalStyles"
//   if (indexLoadExternalStyles !== -1) {
//     // Encontrar a próxima ocorrência de "from" após "loadExternalStyles"
//     const indexFrom = fileContent.indexOf("from", indexLoadExternalStyles);

//     // Verificar se foi encontrado "from" após "loadExternalStyles"
//     if (indexFrom !== -1) {
//       // Encontrar a próxima ocorrência de aspas após "from"
//       const indexFirstQuotation = fileContent.indexOf('"', indexFrom);

//       // Verificar se foi encontrado aspas após "from"
//       if (indexFirstQuotation !== -1) {
//         // Encontrar a próxima ocorrência de aspas após a primeira ocorrência
//         const indexSegundaAspas = fileContent.indexOf(
//           '"',
//           indexFirstQuotation + 1,
//         );

//         // Verificar se foi encontrado a segunda aspas
//         if (indexSegundaAspas !== -1) {
//           // Extrair o conteúdo entre as aspas
//           const content = fileContent.substring(
//             indexFirstQuotation + 1,
//             indexSegundaAspas,
//           );
//           return content;
//         }
//       }
//     }
//   }

//   // Retornar null se não foi possível encontrar o conteúdo
//   return null;
// }

/**
 * Retorna o diretório do arquivo filho baseado no arquivo pai.
 *
 * Isso é útil para arquivos que são carregados dentro de outros arquivos que estão em níveis de pasta
 * diferente.
 *
 * Exemplo:
 *  - [parentPath] ComponentA: "src/components/componentA";
 *  - [childPath]  Title:      "../ui/Title"
 *
 * Esse algoritmo vai mesclar o caminho do pai com filho para obter o caminho correto do arquivo na qual o filho esta, logo:
 *
 * Retorna: "src/ui/Title.tsx"
 *
 * @param {string} parentPath
 * @param {string} childPath
 */
const getFilePathBasedOnParentAndChildFilePath = (parentPath, childPath) => {
  let parentFolder = ".";
  const parentPathParts = parentPath.split("/");
  parentPathParts.pop();
  parentFolder = parentPathParts.join("/");

  // Registra o caminho do elemento filho baseado no caminho do elemento pai
  let importedFileContentPath = path.join(parentFolder, childPath);
  importedFileContentPath = getFilePathWithType(importedFileContentPath);

  return importedFileContentPath;
};

/**
 * Escapa os ` inclusos nos arquivos
 * @param {string} content
 */
const scapeBacktick = (content) => content.replace(/[`$]/g, "\\$&");
// const scapeBacktick = (content) => content.replace(/`/g, "\\`");

/**
 * Troca a primeira palavra após < pela palavra nova
 * @param {string} text content
 * @param {string} wordToSearch word to search for
 * @param {string} wordToSet word to replace the <wordtoSearch>
 * @returns
 */
// const replaceWordAfterTheLessThanSign = (text, wordToSearch, wordToSet) => {
//   // Verifica se tem elemento <Banner> conteudo </Banner>
//   // Troca por Widget

//   // Verifica se tem <Banner e termina com />

//   const regex = new RegExp(`<\\s*(${wordToSearch})\\s*`);
//   return text.replace(regex, wordToSet);
// };

/**
 * Converte object em array
 * @param {object} object
 * @returns
 */
function convertObjectToArray(object) {
  // Inicializa um array vazio para armazenar os resultados
  const resultado = [];

  // Percorre as chaves do objeto
  for (let key in object) {
    // Verifica se a chave é própria do objeto (não herdada)
    resultado.push(`${key}: ${object[key]}`);
  }

  // Retorna o array com as strings "chave: valor"
  return resultado;
}

/**
 * Existe elementos HTML no conteúdo?
 * @param {string} content
 * @returns
 */
const hasHtmlElements = (content) => /<[^>]+>/g.test(content);

module.exports = {
  getFileImportsElements,
  getImportStatements,
  getImportsPath,
  getFilePathWithType,
  removeDuplicatedValuesFromArray,
  getFileComponents,
  getFunctionItemsBetweenParenthesis,
  getComponentName,
  getFirstConstName,
  getFirstLetName,
  getFirstVarName,
  getFirstFunctionName,
  getComponentParams,
  removeLineFromText,
  removeLastLineFromText,
  getHtmlElementProps,
  // extractHtmlElements,
  extractHtmlCompleteElements,
  getHtmlElementName,
  getHtmlElementChildren,
  getImportedElementFileSource,
  getFilePathBasedOnParentAndChildFilePath,
  scapeBacktick,
  // replaceWordAfterTheLessThanSign,
  convertObjectToArray,
  hasHtmlElements,
};
