/**
 * Handle const/var/let names to avoid duplicates
 */

const { process_file, process_file_content } = require("../parse");
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
      ...getExportFunction(schema.content),
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
const createNewName = (currentName) => {
  nonce++;
  return `${currentName}_______${nonce}`;
};

/**
 * Change the fileSchema.content in other files when a dependent item gets its name changed
 * @param {string} contentFilePath
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 */
const replaceItemNamesInOtherFilesContent = (fileSchemas) => {
  /**
   * 1 - quando trocar o nome do item, tem que checar pra ser exato para evitar essa situacao
   * App.fooBaar
   * AppRoute.blabla
   * 
   * Quero trocar o "App" por "App__2", se nao verificar o valor exato, o "AppRoute"
   * também vai ser alterado erroneamente.
   */
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

  // content = content.replaceAll(constRegExp, `const ${newItemName}`);
  // content = content.replaceAll(letRegExp, `let ${newItemName}`);
  // content = content.replaceAll(varRegExp, `var ${newItemName}`);
  // content = content.replaceAll(functionRegExp, `function ${newItemName}`);

  // 1 - Testa, se aprovado, mudar o nome dos items no corpo do arquivo

  // Const
  const testConst = content.match(constRegExp);
  if (testConst) {
    const constName = testConst.join("");
    const newConstName = constName.replaceAll(itemName, newItemName);
    content = content.replaceAll(constName, newConstName);
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName
      fileSchemas,
    );
  }

  // Let
  const testLet = content.match(letRegExp);
  if (testLet) {
    const letName = testLet.join("");
    const newLetName = letName.replaceAll(itemName, newItemName);
    content = content.replaceAll(letName, newLetName);
  }

  // Var
  const testVar = content.match(varRegExp);
  if (testVar) {
    const varName = testVar.join("");
    const newVarName = varName.replaceAll(itemName, newItemName);
    content = content.replaceAll(varName, newVarName);
  }

  // Function
  const testFunction = content.match(functionRegExp);
  if (testFunction) {
    const functionName = testFunction.join("");
    const newFunctionName = functionName.replaceAll(itemName, newItemName);
    content = content.replaceAll(functionName, newFunctionName);
  }

  // 2 - Ir em todos arquivos que dependem deste arquivo e mudar o nome do item lá

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
    // const transpileTypescript =
    //   itemKey.endsWith(".ts") || itemKey.endsWith(".tsx");
    // fileContent = process_file_content(fileContent, transpileTypescript);

    // console.log("TEMP:", fileContent);

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
        const newName = createNewName(exportKeyName);
        exportsOrganizer[itemKey][objIndex][exportKeyName] = newName;
        // exportsOrganizer[itemKey][importKeyName] = 'NewName'

        // atualiza o fileContent com os novos items
        console.log("BEFORE:", fileContent);
        fileContent = replaceNamesInContent(
          fileContent,
          exportKeyName,
          newName,
          itemKey,
          fileSchemas,
        ).content;
        console.log("AFTER:", fileContent);

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

  // console.log("AFTER:", exportsOrganizer);
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
