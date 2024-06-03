const parseAlemFeatures = require("../config/parseAlemFeatures");
const { scapeBacktick } = require("../helpers");
const getProjectName = require("./getProjectName");
const transformSchemaToWidget = require("./transformSchemaToWidget");

/**
 * Load the "componentCodes" from all Widgets based on file schemas
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * the process starts. This is util to inject previous schema files like Além importable items.
 */
const loadComponentCodesObjectByFileSchemas = (fileSchemas, network) => {
  let componentsCodes = "";

  /**
   * Código do Componente/Widget principal de entrada do projeto
   */
  let appComponentFinalBundle = "";

  // Reverse sequence to load the deepest first
  fileSchemas = fileSchemas.reverse();

  // Get Normal js files & Widget files (components transformed to BOS Widgets)
  const completeFileSchemas = transformSchemaToWidget(fileSchemas, network);

  // Processa também os módulos
  let modulesCodes = "";

  // Ejected Files Codes
  let ejectedFiles = [];

  completeFileSchemas.fileSchemas.forEach((fileSchema) => {
    // Prepare Widgets (stateful components)
    if (
      fileSchema.widgetName &&
      !fileSchema.isStateless &&
      !fileSchema.toBeEjected
    ) {
      componentsCodes += `
        ${fileSchema.widgetName}: \`${scapeBacktick(fileSchema.finalFileBundle)}\`,
    `;
    }

    // Ejectables - Arquivos a serem criado fora do indexador principal
    if (fileSchema.toBeEjected) {
      // O nome do projeto deve vir na frente para evitar conflitos com outros
      // aplicativos publicados na mesma conta
      const newWidgetName = `${getProjectName(true)}.${fileSchema.widgetName}`;

      ejectedFiles.push({
        name: newWidgetName,
        content: fileSchema.finalFileBundle,
      });
    }

    // Prepare modules
    if (fileSchema.isModule && !fileSchema.toBeEjected) {
      // let modulesValues = "{";
      // const valuesEntries = Object.entries(fileSchema.moduleProps.values);
      // valuesEntries.forEach((entrie) => {
      //   modulesValues += `
      //       ${entrie[0]}: ${scapeBacktick(entrie[1])},
      //   `;
      // });
      // modulesValues += "}";

      //   modulesCodes += `
      //     "${fileSchema.moduleProps.name}": ${parseAlemFeatures(modulesValues)},
      // `;

      modulesCodes += `
        "${fileSchema.moduleProps.name}": ${parseAlemFeatures(scapeBacktick(fileSchema.moduleProps.module))},
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
    /** Lista de objetos (de arquivos ejetados e serem salvos separadamente) contento {name: nome da pagina/arquivo/widget, content: conteúdo do arquivo processado} */
    ejectedFiles,
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
