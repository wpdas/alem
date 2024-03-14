const loadFilesInfo = require("./loadFilesInfo");
const transformSchemaToWidget = require("./transformSchemaToWidget");

/**
 * Transforma o arquivo informado em um Widget
 *
 * ATENÇÃO: Arquivos transformados em Widget são renderizados de forma diferente. Widgets tem
 * seu próprio estado, os items não transformados compartilham o estado global do Alem
 *
 * @returns {{filePath: string, toImport: string[], content: string, finalFileBundle: string}}
 */
const transformFileToWidget = (fileDir) => {
  const fileInfo = loadFilesInfo(fileDir);
  const fileContents = transformSchemaToWidget(fileInfo.fileSchemas);

  let widgetFileContent =
    fileContents && fileContents[0] ? fileContents[0].finalFileBundle : "";

  return widgetFileContent;
};

module.exports = transformFileToWidget;
