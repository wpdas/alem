const fs = require("fs");
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
  let result = [];
  const importStatements = fileContent.match(regexp.GET_ALL_IMPORT_STATEMENT);

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
};
