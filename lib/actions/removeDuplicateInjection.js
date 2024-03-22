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
 * @param {*} fileSchemaA File Schema para verificar duplicatas
 * @returns
 */
const removeDuplicateInjection = (
  currentFileBundleContent,
  fileSchemas,
  fileSchema,
) => {
  //V3
  // Foi necessário fazer o trim de cada conteúdo. Um ou mais conteúdo estava dando false para a verificação de "includes"
  // devido aos espaçamentos gerados na adição de conteúdo ao bundle.

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
