/**
 * Handle const/var/let names to avoid duplicates
 */

const replaceIdentifierInCode = require("../parsers/replaceIdentifierInCode");
const { create_new_name } = require("../utils");
const getFileExports = require("./getFileExports");

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
const getExportsOrganizer = (fileContent) => {
  // const exportsOrganizer = {};

  // fileSchemas.forEach((schema, schemaIndex) => {
  // Cria lista de exports
  // exportsOrganizer[schema.filePath] = [];

  // console.log("File:", schema.filePath);

  const exports = getFileExports(fileContent);
  const fileExportsOrganizer = {};

  exports.forEach((exportItem) => {
    // exportsOrganizer[schema.filePath].push({ [exportItem]: exportItem });
    fileExportsOrganizer[exportItem] = exportItem;
  });

  // fileSchemas[schemaIndex].exports = fileExportsOrganizer;

  // console.log("Organizer:", fileExportsOrganizer);
  // console.log("\n");
  // });

  return { fileExportsOrganizer, exports };
};

// const getFileExportsOrganizer = (fileSchemas) => {
//   const exportsOrganizer = {};

//   fileSchemas.forEach((schema, schemaIndex) => {
//     // Cria lista de exports
//     exportsOrganizer[schema.filePath] = [];

//     console.log("File:", schema.filePath);

//     const exports = getFileExports(schema.content);
//     const fileExportsOrganizer = {};

//     exports.forEach((exportItem) => {
//       exportsOrganizer[schema.filePath].push({ [exportItem]: exportItem });
//       fileExportsOrganizer[exportItem] = exportItem;
//     });

//     fileSchemas[schemaIndex].exports = fileExportsOrganizer;

//     console.log("Organizer:", exportsOrganizer[schema.filePath]);
//     console.log("\n");
//   });

//   return { fileSchemas, exportsOrganizer };
// };

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
      // const replaceItemRegexp = new RegExp("\\b" + itemName + "\\b", "gm");

      // fileSchemaContent = fileSchemaContent.replaceAll(
      //   replaceItemRegexp,
      //   newItemName,
      // );

      // fileSchemaContent = replaceContentInCurrentFile(
      //   fileSchemaContent,
      //   itemName,
      //   newItemName,
      // );

      fileSchemaContent = replaceIdentifierInCode(
        fileSchemaContent,
        itemName,
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
const replaceContentInCurrentFile = (
  contentFilePath,
  newContent,
  fileSchemas,
) => {
  const currentFileSchema = fileSchemas.find(
    (item) => item.filePath === contentFilePath,
  );
  const fileSchemaIndex = fileSchemas.indexOf(currentFileSchema);

  // Update content
  currentFileSchema.content = newContent;

  fileSchemas[fileSchemaIndex] = currentFileSchema;

  return fileSchemas;
};

/**
 * Replace the item name inside the content
 *
 * Troca o nome dos items dentro dos arquivos desejados
 *
 * @param {string} content
 * @param {string} itemName
 * @param {string} newItemName
 * @param {string} contentFilePath
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas schemas to change the files content when a item gets its name changed
 * @param {string | undefined} previousExportKeyName Nome anterior do itemName caso seja um re-processo de um arquivo alterado
 */
const replaceNamesInContent = (
  content,
  itemName,
  newItemName,
  contentFilePath,
  fileSchemas,
  previousExportKeyName,
) => {
  content = replaceIdentifierInCode(content, itemName, newItemName);

  // 1 - mudar o nome dos items no corpo do arquivo atual
  // Replace content (with updated item names) in current file
  fileSchemas = replaceContentInCurrentFile(
    contentFilePath,
    content,
    fileSchemas,
  );

  // 2 - Ir em todos arquivos que dependem deste arquivo e mudar o nome do item lá
  // Replace item names in other files content
  if (!previousExportKeyName) {
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      itemName,
      newItemName,
      fileSchemas,
    );
  } else {
    fileSchemas = replaceItemNamesInOtherFilesContent(
      contentFilePath,
      previousExportKeyName,
      newItemName,
      fileSchemas,
    );
  }

  return { content, fileSchemas };
};

/**
 * Handle const/var/let names to avoid duplicates
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
const handleNames = (fileSchemas) => {
  // reset_name_counter();
  // let tempBundle = "";
  // Lista de nomes de exports já usados em toda a aplicação
  const takenNames = [];

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
  // const exportsOrganizerData = getExportsOrganizer(fileSchemas);
  // fileSchemas = exportsOrganizerData.fileSchemas;
  // const exportsOrganizer = exportsOrganizerData.exportsOrganizer;

  fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
    // console.log("File:", fileSchema.filePath);

    let fileContent = fileSchema?.content || "";
    const exportsData = getExportsOrganizer(fileContent);
    let fileExportsObj = exportsData.fileExportsOrganizer;
    const fileExportsName = exportsData.exports;

    // Checa se o nome dos exports do arquivo já existem no bundle
    // Exports do arquivo atual
    fileExportsName.forEach((exportKeyName) => {
      // const exportKeyName = Object.keys(exportObj)[0];

      // Verifica se ja tem um recurso (const, var, let, function) usando esse nome
      // if (checkIfItemExistInContent(tempBundle, exportKeyName)) {
      if (takenNames.includes(exportKeyName)) {
        // Se tiver, troca o nome no arquivo/conteudo atual...

        // Troca nome do item no organizer
        /**
         * = {"caminho/arquivo.tsx": [index of export key][key name]}
         */
        const newName = create_new_name();
        // Registra novo nome
        takenNames.push(newName);

        fileExportsObj[exportKeyName] = newName;
        // exportsOrganizer[itemKey][importKeyName] = 'NewName'

        // atualiza o fileContent com os novos items
        // ...e atualiza o nome do item nos arquivos que dependem dele
        const result = replaceNamesInContent(
          fileContent,
          exportKeyName,
          newName,
          fileSchema.filePath,
          fileSchemas,
        );

        fileContent = result.content;
        fileSchemas = result.fileSchemas;
      } else {
        // Registra o nome do elemento sendo exportado para evitar duplicatas
        takenNames.push(exportKeyName);
      }
    });

    // Adiciona os exports para o esquema do arquivo
    fileSchemas[fileSchemaIndex].exports = fileExportsObj;

    // tempBundle += fileContent;
  });

  // Gera arquivo de nomes em uso
  // fs.writeFileSync(
  //   path.join(`./build/takenNames.json`),
  //   JSON.stringify({ takenNames }, null, 2),
  // );

  return fileSchemas;
};

const handleNamesForChangedFile = (
  fileSchemas,
  changedFileSchema,
  changedFileSchemaIndex,
  previousTakenName = [],
) => {
  // reset_name_counter();
  // let tempBundle = "";
  // Lista de nomes de exports já usados em toda a aplicação
  const takenNames = [...previousTakenName];

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
  // const exportsOrganizerData = getExportsOrganizer(fileSchemas);
  // fileSchemas = exportsOrganizerData.fileSchemas;
  // const exportsOrganizer = exportsOrganizerData.exportsOrganizer;

  // fileSchemas.forEach((fileSchema, fileSchemaIndex) => {
  // console.log("File:", fileSchema.filePath);

  let fileContent = changedFileSchema?.content || "";
  const exportsData = getExportsOrganizer(fileContent);
  // const exportsData = changedFileSchema.exports;
  console.log("0", exportsData);
  console.log("1", changedFileSchema.previousExports);
  let fileExportsObj = exportsData.fileExportsOrganizer;
  console.log("A", fileExportsObj);
  const fileExportsName = exportsData.exports;
  console.log("B", fileExportsName);

  // Faz a troca de nomes caso o item sendo exportado tenha recebido um outro nome
  // anteriormente
  // const previousExportsKeys = Object.keys(changedFileSchema.previousExports);
  // fileExportsName.forEach((exportItemName, index) => {
  //   if (previousExportsKeys.includes(exportItemName)) {
  //     fileExportsName[index] =
  //       changedFileSchema.previousExports[exportItemName];
  //   }
  // });

  // console.log("B Updated", fileExportsName);

  // Checa se o nome dos exports do arquivo já existem no bundle
  // Exports do arquivo atual
  fileExportsName.forEach((exportKeyName) => {
    // const exportKeyName = Object.keys(exportObj)[0];

    // Verifica se ja tem um recurso (const, var, let, function) usando esse nome
    // if (checkIfItemExistInContent(tempBundle, exportKeyName)) {
    if (takenNames.includes(exportKeyName)) {
      // Se tiver, troca o nome no arquivo/conteudo atual...

      // Troca nome do item no organizer
      /**
       * = {"caminho/arquivo.tsx": [index of export key][key name]}
       */
      const newName = create_new_name();

      // Registra novo nome
      takenNames.push(newName);

      fileExportsObj[exportKeyName] = newName;
      // exportsOrganizer[itemKey][importKeyName] = 'NewName'

      // Pega o nome que era usado para o item antes do processo atual. Isso é importante pois
      // os arquivos que dependem deste item estão até este momento, usando o nome anterior
      // e eles precisam ser alterados para o novo nome deste item. Isso será feito dentro do
      // "replaceNamesInContent"
      // Exemplo, se "Button" foi mudado para "A_14", logo, agora ele deve ter o nome
      // "A_14" para que os arquivos que o receberam com esse nome possam ser atualizados
      // com o novo novo nome que esse item receberá após ser editado. Sim, o valor sempre
      // será diferente porque a função que cria novos nomes sempre é incrementada
      const previousExportKeyName =
        changedFileSchema.previousExports[exportKeyName];

      // atualiza o fileContent com os novos items
      // ...e atualiza o nome do item nos arquivos que dependem dele
      const result = replaceNamesInContent(
        fileContent,
        exportKeyName,
        newName,
        changedFileSchema.filePath,
        fileSchemas,
        previousExportKeyName,
      );

      fileContent = result.content;
      fileSchemas = result.fileSchemas;
    } else {
      // Registra o nome do elemento sendo exportado para evitar duplicatas
      takenNames.push(exportKeyName);
    }
  });

  // Adiciona os exports para o esquema do arquivo
  fileSchemas[changedFileSchemaIndex].exports = fileExportsObj;

  // tempBundle += fileContent;
  // });

  return fileSchemas;
};

module.exports = {
  handleNames,
  handleNamesForChangedFile,
};
