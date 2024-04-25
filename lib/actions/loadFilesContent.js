const parseAlemFeatures = require("../config/parseAlemFeatures");
const { scapeBacktick } = require("../helpers");
const transformSchemaToWidget = require("./transformSchemaToWidget");

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

  // Processa também os módulos
  let modulesCodes = "";

  completeFileSchemas.fileSchemas.forEach((fileSchema) => {
    // Prepare Widgets (stateful components)
    if (fileSchema.widgetName && !fileSchema.isStateless) {
      componentsCodes += `
        ${fileSchema.widgetName}: \`${scapeBacktick(fileSchema.finalFileBundle)}\`,
    `;
    }

    // Prepare modules
    if (fileSchema.isModule) {
      let modulesValues = "{";
      const valuesEntries = Object.entries(fileSchema.moduleProps.values);
      valuesEntries.forEach((entrie) => {
        modulesValues += `
            ${entrie[0]}: ${scapeBacktick(entrie[1])},
        `;
      });
      modulesValues += "}";

      modulesCodes += `
        "${fileSchema.moduleProps.name}": ${parseAlemFeatures(modulesValues)},
    `;
    }

    if (fileSchema.widgetName === "App") {
      appComponentFinalBundle = fileSchema.finalFileBundle;
    }
  });

  return {
    /** Código final de todos os componentes do projeto */
    componentsCodes,
    /** Código final de todos os módulos. Eles serão inseridos no escopo global e disponível para todos os subcomponents */
    modulesCodes,
    /** Código final do componente App de entrada do projet apenas. (src/index.tsx | .jsx) */
    appComponentFinalBundle,
    /** Esquema final de todos os arquivos processados */
    completeFileSchemas: completeFileSchemas.fileSchemas,
    error: completeFileSchemas.processError,
  };
};

module.exports = {
  loadComponentCodesObjectByFileSchemas,
};
