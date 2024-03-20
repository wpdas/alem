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
const removeDuplicateInjection = (
  currentFileBundleContent,
  fileSchemas,
  fileSchemaA,
  fileSchemaB,
) => {
  if (!fileSchemaA.injectedFiles || !fileSchemaB.injectedFiles) {
    return currentFileBundleContent;
  }

  fileSchemaA.injectedFiles.forEach((itemA) => {
    const duplicateFound = fileSchemaB.injectedFiles.includes(itemA);

    if (duplicateFound) {
      console.log("\n");
      log.info(
        `Conflict found while injecting "${fileSchemaB.filePath}" into "${fileSchemaA.filePath}". File: "${itemA}"`,
      );
      log.info("Fixing it...");

      const conflictedContent = fileSchemas.find(
        (item) => item.filePath === itemA,
      );

      // Se achar o conteúdo duplicado no bundle do fileSchema, remove ele
      if (
        currentFileBundleContent.includes(conflictedContent.finalFileBundle)
      ) {
        currentFileBundleContent = currentFileBundleContent.replace(
          conflictedContent.finalFileBundle,
          "",
        );
      }
      log.sucess("Fix done!");
      console.log("\n");
    }
  });

  return currentFileBundleContent;
};

module.exports = removeDuplicateInjection;
