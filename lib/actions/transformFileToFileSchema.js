const loadFilesInfo = require("./loadFilesInfo");

/**
 * Transforma o arquivo informado em um Widget
 *
 * ATENÇÃO: Arquivos transformados em Widget são renderizados de forma diferente. Widgets tem
 * seu próprio estado, os items não transformados compartilham o estado global do Alem
 *
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string, componentImportItems:[], componentParamsItems:[], componentComponentItems: [], widgetName?: string, htmlElementsProps: {}}[]}
 */
const transformFileToFileSchema = (fileDir) => {
  return loadFilesInfo.loadFilesInfo(fileDir).fileSchemas[0];
};

module.exports = transformFileToFileSchema;
