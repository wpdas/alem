/**
 * Handle const/var/let names to avoid duplicates
 */

const {
  BETWEEN_EXPORT_CONST_AND_EQUAL,
  SPACES,
  BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  AFTER_EXPORT_DEFAULT,
  SPECIAL_CHARACTERS_AND_SPACES,
} = require("../regexp");

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
    // getExportConsts(schema.content);
    // Verifica se já tem os nomes de elementos no conteúdo anterior
    // exports = [...exports, ...getExportConsts(schema.content)];

    exports = [
      ...getExportConsts(schema.content),
      ...getExportDefaultFunction(schema.content),
      ...getExportDefault(schema.content),
    ];

    exports.forEach((exportItem) =>
      exportsOrganizer[schema.filePath].push({ [exportItem]: exportItem }),
    );

    // exports.push(...getExportConsts(schema.content));
    // console.log(exports);
  });

  return exportsOrganizer;
};

/**
 * Handle const/var/let names to avoid duplicates
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
const handleNames = (fileSchemas) => {
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
  console.log(itemsToProcess);

  // console.log(exportsOrganizer);
};

module.exports = handleNames;

// 1 - Ler o schema de cada arquivo (loadFilesInfo faz isso)
// 2 - Pegar esses dados e checar conteudo de arquivo por arquivo se tem duplicidade
// 3 - Gerar o seguinte esquema

/**
 * exports organizer
 * {
 *    "caminho/do/arquivo.jsx": [{MyVar: "MyVar_newName"}, {MyVar2: "MyVar2_nameName"}]
 * }
 */

// - Carregar o conteúdo do arquivo anterior
// - No arquivo atual, checar se seus exports / export defaul já existe no conteúdo anterior
// - Se já existir, muda o nome das vars no arquivo atual
