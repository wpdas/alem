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
 *
 * returns:  [{MyVar: "MyVar"}, {MyVar2: "MyVar2"}]
 *
 *
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 * @returns {Record<string, {Record<string, string>}[]>}
 */
const getFileExports = (fileContent) => {
  // TODO: melhorar isso usando Babel ? (pode ser mais penoso para processar se usar Babel)
  const exports = [
    ...getExportConsts(fileContent),
    ...getExportLets(fileContent),
    ...getExportVars(fileContent),
    ...getExportFunction(fileContent),
    ...getExportDefaultFunction(fileContent),
    ...getExportDefault(fileContent),
  ];

  return exports;
};

module.exports = getFileExports;
