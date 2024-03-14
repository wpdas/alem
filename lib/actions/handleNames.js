/**
 * Handle const/var/let names to avoid duplicates
 */

const {
  BETWEEN_EXPORT_CONST_AND_EQUAL,
  SPACES,
  BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  AFTER_EXPORT_DEFAULT,
  SPECIAL_CHARACTERS_AND_SPACES,
  BETWEEN_EXPORT_LET_AND_EQUAL,
  BETWEEN_EXPORT_VAR_AND_EQUAL,
  BETWEEN_EXPORT_FUNCTION_AND_OPEN_PARENTHESE,
} = require("../regexp");
const { create_new_name, reset_name_counter } = require("../utils");
const handleUseStateValues = require("./handleUseStateValues");

/**
 * Get "export const" items
 * @param {string} content
 */
const getExportConsts = (content) => {
  let foundItems = content.match(BETWEEN_EXPORT_CONST_AND_EQUAL);

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) => item.replaceAll(SPACES, ""));
  }

  return foundItems || [];
};

/**
 * Get "export let" items
 * @param {string} content
 */
const getExportLets = (content) => {
  let foundItems = content.match(BETWEEN_EXPORT_LET_AND_EQUAL);

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) => item.replaceAll(SPACES, ""));
  }

  return foundItems || [];
};

/**
 * Get "export var" items
 * @param {string} content
 */
const getExportVars = (content) => {
  let foundItems = content.match(BETWEEN_EXPORT_VAR_AND_EQUAL);

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) => item.replaceAll(SPACES, ""));
  }

  return foundItems || [];
};

/**
 * Get "export function" items
 * @param {string} content
 */
const getExportFunction = (content) => {
  let foundItems = content.match(BETWEEN_EXPORT_FUNCTION_AND_OPEN_PARENTHESE);

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) => item.replaceAll(SPACES, ""));
  }

  return foundItems || [];
};

/**
 * Get "export default function" items
 * @param {string} content
 */
const getExportDefaultFunction = (content) => {
  let foundItems = content.match(
    BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  );

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) => item.replaceAll(SPACES, ""));
  }

  return foundItems || [];
};

/**
 * Get "export default" items
 * @param {string} content
 */
const getExportDefault = (content) => {
  // Remove all "export default function"
  const _content = content.replaceAll("export default function", "");

  let foundItems = _content.match(AFTER_EXPORT_DEFAULT);

  // Remove spaces
  if (foundItems) {
    foundItems = foundItems.map((item) =>
      item.replaceAll(SPACES, "").replaceAll(SPECIAL_CHARACTERS_AND_SPACES, ""),
    );
  }

  return foundItems || [];
};

/**
 * Generates the exports schema
 *
 *
 * exports organizer - original state
 * {
 *    "caminho/do/arquivo.jsx": [{MyVar: "MyVar"}, {MyVar2: "MyVar2"}]
 * }
 *
 * exports organizer - when the item needs to be changed
 * {
 *    "caminho/do/arquivo.jsx": [{MyVar: "MyVar_newName"}, {MyVar2: "MyVar2_nameName"}]
 * }
 *
 *
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {Record<string, {Record<string, string>}[]>}
 */
const getExportsOrganizer = (fileSchemas) => {
  const exportsOrganizer = [];

  fileSchemas.forEach((schema) => {
    // Cria lista de exports
    exportsOrganizer[schema.filePath] = [];

    let exports = [];
    // Verifica se já tem os nomes de elementos no conteúdo anterior
    // exports = [...exports, ...getExportConsts(schema.content)];

    exports = [
      ...getExportConsts(schema.content),
      ...getExportLets(schema.content),
      ...getExportVars(schema.content),
      ...getExportFunction(schema.content),
      ...getExportDefaultFunction(schema.content),
      ...getExportDefault(schema.content),
    ];

    exports.forEach((exportItem) =>
      exportsOrganizer[schema.filePath].push({ [exportItem]: exportItem }),
    );
  });

  return exportsOrganizer;
};

/**
 * Change the fileSchema.content in other files when a dependent item gets its name changed
 * @param {string} contentFilePath
 * @param {string} itemName
 * @param {string} newItemName
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 */
const replaceItemNamesInOtherFilesContent = (
  contentFilePath,
  itemName,
  newItemName,
  fileSchemas,
) => {
  /**
   * 1 - quando trocar o nome do item, tem que checar pra ser exato para evitar essa situacao
   * App.fooBaar
   * AppRoute.blabla
   *
   * Quero trocar o "App" por "App__2", se nao verificar o valor exato, o "AppRoute"
   * também vai ser alterado erroneamente. ex: "App__2Route".
   */

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // Verifica se esse fileSchema depende do arquivo atual
    if (fileSchema.toImport.includes(contentFilePath)) {
      // Se tiver, altera o conteúdo deste arquivo para usar o novo nome do item importado
      // do arquivo atual
      let fileSchemaContent = fileSchema.content;

      // RegExp aqui
      // Regex: Troca somente e tão somente o item, nem mais nem menos, evitando assim
      // trocar items erronamente como na descricao acima.
      const replaceItemRegexp = new RegExp("\\b" + itemName + "\\b", "gm");

      fileSchemaContent = fileSchemaContent.replaceAll(
        replaceItemRegexp,
        newItemName,
      );

      // Seta novo valor
      fileSchemas[fileSchemaIndex].content = fileSchemaContent;
    }
  });

  return fileSchemas;
};

/**
 * Replace content in current file (inside the fileSchema)
 * @param {string} contentFilePath
 * @param {string} content
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 */
const replaceContentInCurrentFile = (contentFilePath, content, fileSchemas) => {
  const currentFileSchema = fileSchemas.find(
    (item) => item.filePath === contentFilePath,
  );
  const fileSchemaIndex = fileSchemas.indexOf(currentFileSchema);

  // Update content
  currentFileSchema.content = content;

  fileSchemas[fileSchemaIndex] = currentFileSchema;

  return fileSchemas;
};

/**
 * Replace the item name inside the content
 * @param {string} content
 * @param {string} itemName
 * @param {string} newItemName
 * @param {string} contentFilePath
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 */
const replaceNamesInContent = (
  content,
  itemName,
  newItemName,
  contentFilePath,
  fileSchemas,
) => {
  // Replace const values
  // ex: const App
  // nao pega: const AppRoute
  // O mesmo para os proximos
  // (const App)[^a-zA-Z0-9=]
  // TODO: reutilizar os do checkIfItemExistInContent
  const constRegExp = new RegExp(`(const ${itemName})[^a-zA-Z0-9=]`, "gm");
  const letRegExp = new RegExp(`(let ${itemName})[^a-zA-Z0-9=]`, "gm");
  const varRegExp = new RegExp(`(var ${itemName})[^a-zA-Z0-9=]`, "gm");
  const functionRegExp = new RegExp(
    `(function ${itemName})[^a-zA-Z0-9=]`,
    "gm",
  );

  // 1 - Testa, se aprovado, mudar o nome dos items no corpo do arquivo atual
  // 2 - Ir em todos arquivos que dependem deste arquivo e mudar o nome do item lá

  // Const
  const testConst = content.match(constRegExp);
  if (testConst) {
    const constName = testConst.join("");
    const newConstName = constName.replaceAll(itemName, newItemName);
    content = content.replaceAll(constName, newConstName);

    // Replace content (with updated item names) in current file
    fileSchemas = replaceContentInCurrentFile(
      contentFilePath,
      content,
      fileSchemas,
    );

    // Replace item names in other files content
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName,
      fileSchemas,
    );
  }

  // Let
  const testLet = content.match(letRegExp);
  if (testLet) {
    const letName = testLet.join("");
    const newLetName = letName.replaceAll(itemName, newItemName);
    content = content.replaceAll(letName, newLetName);

    // Replace content (with updated item names) in current file
    fileSchemas = replaceContentInCurrentFile(
      contentFilePath,
      content,
      fileSchemas,
    );

    // Replace item names in other files content
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName,
      fileSchemas,
    );
  }

  // Var
  const testVar = content.match(varRegExp);
  if (testVar) {
    const varName = testVar.join("");
    const newVarName = varName.replaceAll(itemName, newItemName);
    content = content.replaceAll(varName, newVarName);

    // Replace content (with updated item names) in current file
    fileSchemas = replaceContentInCurrentFile(
      contentFilePath,
      content,
      fileSchemas,
    );

    // Replace item names in other files content
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName,
      fileSchemas,
    );
  }

  // Function
  const testFunction = content.match(functionRegExp);
  if (testFunction) {
    const functionName = testFunction.join("");
    const newFunctionName = functionName.replaceAll(itemName, newItemName);
    content = content.replaceAll(functionName, newFunctionName);

    // Replace content (with updated item names) in current file
    fileSchemas = replaceContentInCurrentFile(
      contentFilePath,
      content,
      fileSchemas,
    );

    // Replace item names in other files content
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName,
      fileSchemas,
    );
  }

  return { content, fileSchemas };
};

/**
 * Verifica se o item (const, let, var, function) existe no content
 * @param {string} content
 * @param {string} itemName
 */
const checkIfItemExistInContent = (content, itemName) => {
  // Replace const values
  // ex: const App
  // nao pega: const AppRoute
  // O mesmo para os proximos
  // (const App)[^a-zA-Z0-9=]
  const constRegExp = new RegExp(`(const ${itemName})[^a-zA-Z0-9=]`, "gm");
  const letRegExp = new RegExp(`(let ${itemName})[^a-zA-Z0-9=]`, "gm");
  const varRegExp = new RegExp(`(var ${itemName})[^a-zA-Z0-9=]`, "gm");
  const functionRegExp = new RegExp(
    `(function ${itemName})[^a-zA-Z0-9=]`,
    "gm",
  );

  return Boolean(
    content.match(constRegExp) ||
      content.match(letRegExp) ||
      content.match(varRegExp) ||
      content.match(functionRegExp),
  );
};

/**
 * Handle const/var/let names to avoid duplicates
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
const handleNames = (fileSchemas) => {
  reset_name_counter();
  let tempBundle = "";

  /**
   * exports organizer - original state
   * {
   *    "caminho/do/arquivo.jsx": [{MyVar: "MyVar"}, {MyVar2: "MyVar2"}]
   * }
   *
   * exports organizer - when the item needs to be changed
   * {
   *    "caminho/do/arquivo.jsx": [{MyVar: "MyVar_newName"}, {MyVar2: "MyVar2_nameName"}]
   * }
   */
  const exportsOrganizer = getExportsOrganizer(fileSchemas);

  // Observe and changes duplicated names
  // reverse (need to load deepest content first)
  const itemsToProcess = Object.keys(exportsOrganizer).reverse();
  // ex: itemKey = caminho/para/arquivo.tsx
  itemsToProcess.forEach((itemKey) => {
    const fileSchema = fileSchemas.find(
      (fileSchema) => fileSchema.filePath === itemKey,
    );

    let fileContent = fileSchema?.content || "";

    // Checa se o nome dos exports do arquivo já existem no bundle
    // Exports do arquivo atual
    exportsOrganizer[itemKey].forEach((exportObj, objIndex) => {
      const exportKeyName = Object.keys(exportObj)[0];

      // Verifica se ja tem um recurso (const, var, let, function) usando esse nome
      if (checkIfItemExistInContent(tempBundle, exportKeyName)) {
        // Se tiver, troca o nome no arquivo/conteudo atual...

        // Troca nome do item no organizer
        /**
         * = {"caminho/arquivo.tsx": [index of export key][key name]}
         */
        const newName = create_new_name();
        exportsOrganizer[itemKey][objIndex][exportKeyName] = newName;
        // exportsOrganizer[itemKey][importKeyName] = 'NewName'

        // atualiza o fileContent com os novos items
        // ...e atualiza o nome do item nos arquivos que dependem dele
        const result = replaceNamesInContent(
          fileContent,
          exportKeyName,
          newName,
          itemKey,
          fileSchemas,
        );

        fileContent = result.content;
        fileSchemas = result.fileSchemas;
      }
    });

    tempBundle += fileContent;
  });

  // Update useState values name
  // fileSchemas = handleUseStateValues(fileSchemas);

  return fileSchemas;
};

module.exports = handleNames;
