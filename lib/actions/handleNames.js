/**
 * Handle const/var/let names to avoid duplicates
 */

const { process_file } = require("../parse");
const {
  BETWEEN_EXPORT_CONST_AND_EQUAL,
  SPACES,
  BETWEEN_EXPORT_DEFAULT_FUNCTION_AND_OPEN_PARENTHESE,
  AFTER_EXPORT_DEFAULT,
  SPECIAL_CHARACTERS_AND_SPACES,
  BETWEEN_EXPORT_LET_AND_EQUAL,
  BETWEEN_EXPORT_VAR_AND_EQUAL,
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
      ...getExportLets(schema.content),
      ...getExportVars(schema.content),
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

// TODO: gerar hash com hash anterior
let nonce = 0;
/**
 * Generate new name
 * @param {string} currentName
 */
const newName = (currentName) => {
  nonce++;
  return `${currentName}_______${nonce}`;
};

/**
 * Replace the item name inside the content
 * @param {string} content
 * @param {string} itemName
 * @param {string} newItemName
 */
const replaceNamesInContent = (content, itemName, newItemName) => {
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

  content = content.replaceAll(constRegExp, `const ${newItemName}`);
  content = content.replaceAll(letRegExp, `let ${newItemName}`);
  content = content.replaceAll(varRegExp, `var ${newItemName}`);
  content = content.replaceAll(functionRegExp, `function ${newItemName}`);

  return content;
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

  // const
  // if (itemName === "Des") {
  //   const has = content.match(constRegExp);

  //   if (has) {
  //     console.log(
  //       "NAO TEM? HUMMM ===>",
  //       constRegExp.test(content),
  //       // content.match(functionRegExp).join("").replaceAll("(", ""),
  //       content.includes(`const ${itemName}`),
  //     );
  //   }
  // }

  // Function
  // if (itemName === "Des") {
  //   const has = content.match(functionRegExp);
  //   if (has) {
  //     console.log(
  //       "NAO TEM? HUMMM ===>",
  //       functionRegExp,
  //       functionRegExp.test(content),
  //       content.match(functionRegExp).join("").replaceAll("(", ""),
  //       content.includes(`function ${itemName}`),
  //     );
  //   }
  // }

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
  console.log("BEFORE", exportsOrganizer);

  // Observe and changes duplicated names
  // reverse (need to load deepest content first)
  const itemsToProcess = Object.keys(exportsOrganizer).reverse();
  // ex: itemKey = caminho/para/arquivo.tsx
  itemsToProcess.forEach((itemKey) => {
    const fileSchema = fileSchemas.find(
      (fileSchema) => fileSchema.filePath === itemKey,
    );

    let fileContent = fileSchema?.content || "";

    // Processed content
    fileContent = process_file(null, fileContent);

    // Checa se o nome dos exports do arquivo já existem no bundle
    // ex: exportObj = {MyVar: "MyVar"}
    // console.log("BEEEEEEEEEEEEE", exportsOrganizer[itemKey]);
    // Exports do arquivo atual
    exportsOrganizer[itemKey].forEach((exportObj, objIndex) => {
      // exceto o propio arquivo
      // console.log("BEEEEEEEEEEEEE", exportsOrganizer[itemKey]);
      // if (itemKey !== )
      const exportKeyName = Object.keys(exportObj)[0];
      // console.log(exportKeyName);
      // Verifica se ja tem um recurso (const, var, let, function) usando esse nome
      console.log(
        "BRUUUUTUUUUSSS:",
        checkIfItemExistInContent(tempBundle, exportKeyName),
        exportKeyName,
      );
      if (checkIfItemExistInContent(tempBundle, exportKeyName)) {
        // Se tiver, troca o nome no arquivo/conteudo atual...
        console.log("TEM IGUAL PAI:", exportKeyName);
        // Troca nome do item no organizer
        // console.log(
        //   "FOOO:",
        //   exportsOrganizer[itemKey][objIndex][exportKeyName],
        // );
        /**
         * = {"caminho/arquivo.tsx": [index of export key][key name]}
         */
        exportsOrganizer[itemKey][objIndex][exportKeyName] =
          newName(exportKeyName);
        // exportsOrganizer[itemKey][importKeyName] = 'NewName'

        // atualiza o fileContent

        // ...e atualiza o nome do item nos arquivos que dependem dele
      }
      // console.log(exportObj);
    });

    tempBundle += fileContent;

    // console.log(itemContent);
    // Referencia o conteúdo do item
    // const itemContent = item;
  });
  // console.log(itemsToProcess);

  console.log("AFTER:", exportsOrganizer);
  // console.log(tempBundle);
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
