const {
  getFileImportsElements,
  getImportedElementFileSource,
} = require("../helpers");
const transformImports = require("../parsers/transformImports");
const importableFiles = require("../config/importableFiles");

/**
 * Caso tenha dependencias do Alem (inportable items), prepara eles para serem injetados.
 *
 * Remove os elementos da chave em que está e coloca em uma nova linha contendo seu caminho
 * até a lib alem-vm/importable/item...
 * @param {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}} fileSchema
 */
const prepareAlemDependencies = (originalFileContent) => {
  const importItems = getFileImportsElements(originalFileContent);

  let updatedFileContent = originalFileContent;
  const alemDependencies = []; // Lista de dependencias Além (diretorio dos arquivos)

  importItems.forEach((item) => {
    // TODO: [Alem items: Routes, Link, etc] Checar se esta dando conflito com items do projeto

    const importStatementFileSource = getImportedElementFileSource(
      updatedFileContent,
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
        alemDependencies.push(alemImportElement);
        updatedFileContent = transformImports(
          updatedFileContent,
          item,
          alemImportElement,
        );
      }
    }
  });

  return { updatedFileContent, alemDependencies };
};

module.exports = prepareAlemDependencies;
