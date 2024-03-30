const { scapeBacktick } = require("../helpers");
const transformSchemaToWidget = require("./transformSchemaToWidget");

/**
 * (Recommended)
 * Load files based on the fileSchemas sequence
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
const loadFilesContentByFileSchemas = (fileSchemas) => {
  let bundleFile = "";
  // Reverse sequence to load the deepest first
  fileSchemas = fileSchemas.reverse();

  // Get Normal js files & Widget files (components transformed to BOS Widgets)
  const completeFileSchemas = transformSchemaToWidget(fileSchemas);

  completeFileSchemas.fileSchemas.forEach((fileSchema) => {
    bundleFile += fileSchema.finalFileBundle;
  });

  return bundleFile;
};

/**
 * Load the "componentCodes" from all Widgets based on file schemas
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @param {*} additionalFileSchemas FileSchemas to be added to the list of main fileSchemas. It's going to be added first before
 * the process starts. This is util to inject previous schema files like Além importable items.
 */
const loadComponentCodesObjectByFileSchemas = (
  fileSchemas,
  additionalFileSchemas,
) => {
  let componentsCodes = "";

  /**
   * Código do Componente/Widget principal de entrada do projeto
   */
  let appComponentFinalBundle = "";

  // Reverse sequence to load the deepest first
  fileSchemas = fileSchemas.reverse();

  // Get Normal js files & Widget files (components transformed to BOS Widgets)
  const completeFileSchemas = transformSchemaToWidget(
    fileSchemas,
    additionalFileSchemas,
  );

  completeFileSchemas.fileSchemas.forEach((fileSchema) => {
    if (fileSchema.widgetName && !fileSchema.isModule) {
      componentsCodes += `
        ${fileSchema.widgetName}: \`${scapeBacktick(fileSchema.finalFileBundle)}\`,
    `;
    }

    if (fileSchema.widgetName === "App") {
      appComponentFinalBundle = fileSchema.finalFileBundle;
    }
  });

  return {
    /** Código final de todos os componentes do projeto */
    componentsCodes,
    /** Código final do componente App de entrada do projet apenas. (src/index.tsx | .jsx) */
    appComponentFinalBundle,
    /** Esquema final de todos os arquivos processados */
    completeFileSchemas: completeFileSchemas.fileSchemas,
    error: completeFileSchemas.processError,
  };
};

module.exports = {
  loadFilesContentByFileSchemas,
  loadComponentCodesObjectByFileSchemas,
};
