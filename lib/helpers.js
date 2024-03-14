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
  const showLogs = true;
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

module.exports = {
  getFileImportsElements,
  getImportStatements,
  getImportsPath,
  getFilePathWithType,
};
