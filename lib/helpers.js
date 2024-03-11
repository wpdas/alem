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
  let fileImports = [];
  fileContent.match(/(?<=import)(.*?)(?=from)/gm).forEach((value) => {
    value.split(",").forEach((subValue) => {
      fileImports.push(
        subValue.replaceAll(regexp.SPECIAL_CHARACTERS_AND_SPACES, ""),
      );
    });
  });
  return fileImports;
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

  // let result = [];

  // const regex =
  //   /import\s+([^{},]+|\{([^{}]+)\})(?:,\s+([^{},]+|\{([^{}]+)\}))*\s+from/g;

  // let matches;

  // while ((matches = regex.exec(fileContent)) !== null) {
  //   for (let i = 1; i < matches.length; i++) {
  //     if (matches[i] !== undefined) {
  //       result.push(matches[i].trim());
  //     }
  //   }
  // }

  // // console.log(items); // Saída: ["Sidebar", "Des", "Foo"]
  // return result;
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
