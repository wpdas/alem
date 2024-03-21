/**
 * Responsável por checar se um componente já tem uma dependencia injetada antes de injetar uma
 * sub-dependencia que também esteja usando a dependencia já existente.
 *
 * Se o conteúdo importado já tiver sido injetado, apenas remove ele usando a referencia
 * providenciada pelo "injectedFiles" de cada file schema
 */
const { log } = require("../utils");

/**
 * Responsável por checar se um componente já tem uma dependencia injetada antes de injetar uma
 * sub-dependencia que também esteja usando a dependencia já existente.
 *
 * Se o conteúdo importado já tiver sido injetado, apenas remove ele usando a referencia
 * providenciada pelo "injectedFiles" de cada file schema
 *
 * @param {*} currentFileBundleContent Conteúdo do arquivo sendo processado. (Poderia ser extraido direto do fileSchemaA porém o bundle
 * é sempre tratado primeiro antes de ser inserido novamente no schema).
 * @param {*} fileSchemas Lista de fileSchema contendo todos os fileSchema do projeto
 * @param {*} fileSchemaA File Schema na qual vai ser inserido o recurso do File Schema B
 * @param {*} fileSchemaB File Schema que terá o conteúdo inserido no File Schema A
 * @returns
 */
// const removeDuplicateInjection = (
//   currentFileBundleContent,
//   fileSchemas,
//   fileSchemaA,
//   fileSchemaB,
// ) => {
//   if (!fileSchemaA.injectedFiles || !fileSchemaB.injectedFiles) {
//     return currentFileBundleContent;
//   }

//   console.log("\n");
//   console.log(
//     "PROCESSANDO:",
//     fileSchemaA.filePath,
//     "- E -",
//     fileSchemaB.filePath,
//   );
//   console.log("LISTA B::", fileSchemaB.injectedFiles);
//   fileSchemaA.injectedFiles.forEach((itemA) => {
//     console.log("PROCURANDO -> ", itemA);
//     const duplicateFound = fileSchemaB.injectedFiles.includes(itemA);

//     if (duplicateFound) {
//       console.log("\n");
//       log.info(
//         `Conflict found while injecting "${fileSchemaB.filePath}" into "${fileSchemaA.filePath}". File: "${itemA}"`,
//       );
//       log.info("Fixing it...");

//       const conflictedContent = fileSchemas.find(
//         (item) => item.filePath === itemA,
//       );

//       // Se achar o conteúdo duplicado no bundle do fileSchema, remove ele
//       if (
//         currentFileBundleContent.includes(conflictedContent.finalFileBundle)
//       ) {
//         currentFileBundleContent = currentFileBundleContent.replace(
//           conflictedContent.finalFileBundle,
//           "",
//         );

//         // currentFileBundleContent = `

//         // ${conflictedContent}

//         // ${currentFileBundleContent}
//         // `;
//       }
//       log.sucess("Fix done!");
//       console.log("\n");
//     }
//   });

//   return currentFileBundleContent;
// };

// V2
// const removeDuplicateInjection = (
//   currentFileBundleContent,
//   fileSchemas,
//   fileSchema,
// ) => {
//   if (!fileSchema.injectedFiles || !fileSchemas) {
//     return currentFileBundleContent;
//   }

//   const itemsToRemove = {};

//   fileSchema.injectedFiles.forEach((filePath) => {
//     const itemsFound = fileSchema.injectedFiles.filter(
//       (item) => item === filePath,
//     ).length;

//     if (itemsFound >= 2) {
//       itemsToRemove[filePath] = itemsFound - 1;
//     }
//   });

//   // console.log("ITEMS TO REMOVE:", itemsToRemove);

//   Object.keys(itemsToRemove).forEach((filePath) => {
//     const conflictedContent = fileSchemas.find(
//       (item) => item.filePath === filePath,
//     );

//     console.log("\n");
//     log.info(`Duplicate content found: ${fileSchema.filePath}!`);
//     log.info("Fixing it...");

//     for (let i = itemsToRemove[filePath]; i > 0; i--) {
//       if (
//         currentFileBundleContent.includes(conflictedContent.finalFileBundle)
//       ) {
//         log.info(`Duplicate content removed: ${filePath}.`);
//         currentFileBundleContent = currentFileBundleContent.replace(
//           conflictedContent.finalFileBundle,
//           "",
//         );

//         itemsToRemove[filePath] = i - 1;
//       }
//     }
//   });

//   // console.log("ITEMS TO REMOVE FINAL:", itemsToRemove);

//   return currentFileBundleContent;
// };

//V3
// Foi necessário fazer o trim de cada conteúdo. Um ou mais conteúdo estava dando false para a verificação de "includes"
// devido aos espaçamentos gerados na adição de conteúdo ao bundle.
const removeDuplicateInjection = (
  currentFileBundleContent,
  fileSchemas,
  fileSchema,
) => {
  // Logs control
  const showLogs = false;

  if (!fileSchema.injectedFiles || !fileSchemas) {
    return currentFileBundleContent;
  }

  const itemsToRemove = {};

  fileSchema.injectedFiles.forEach((filePath) => {
    const itemsFound = fileSchema.injectedFiles.filter(
      (item) => item === filePath,
    ).length;

    if (itemsFound >= 2) {
      itemsToRemove[filePath] = itemsFound - 1;
    }
  });

  // console.log("ITEMS TO REMOVE:", itemsToRemove);

  Object.keys(itemsToRemove).forEach((filePath) => {
    const conflictedContent = fileSchemas.find(
      (item) => item.filePath === filePath,
    );

    if (showLogs) {
      log.info(`Duplicate content found: ${fileSchema.filePath}!`);
      log.info("Fixing it...");
    }
    // console.log("VER:", filePath, itemsToRemove[filePath]);

    for (let i = itemsToRemove[filePath]; i > 0; i--) {
      // console.log(
      //   "Bundle includes?",
      //   filePath,
      //   currentFileBundleContent
      //     .trim()
      //     .includes(conflictedContent.finalFileBundle.trim()),
      // );

      // currentFileBundleContent = currentFileBundleContent.replace(/^\s+/gm, "");

      if (
        currentFileBundleContent
          .trim()
          .includes(conflictedContent.jsContent.trim())
      ) {
        if (showLogs) {
          log.info(`Duplicate content removed: ${filePath}.`);
        }

        const backup_currentFileBundleContent = currentFileBundleContent;
        currentFileBundleContent = currentFileBundleContent
          .trim()
          .replace(conflictedContent.jsContent.trim(), "");

        itemsToRemove[filePath] = i - 1;

        // Checa se todos os items foram apagados, se for o caso, isso é um erro,
        // deve ter ao menos 1 item desse no corpo
        if (
          !currentFileBundleContent
            .trim()
            .includes(conflictedContent.jsContent.trim())
        ) {
          if (showLogs) {
            log.error(
              `Item has been completely removed! Inserting item again...`,
              // NOTE: This appears to be an issue with the "injectFilesDependencies"
              // function which is putting more injections into the list than into the final bundle.
            );
          }

          currentFileBundleContent = backup_currentFileBundleContent;
        }

        if (showLogs) {
          console.log("\n");
        }
      } else {
        log.error("Error removing duplicate item:", filePath);
      }
    }
  });

  // console.log("ITEMS TO REMOVE FINAL:", itemsToRemove);

  return currentFileBundleContent;
};

module.exports = removeDuplicateInjection;
