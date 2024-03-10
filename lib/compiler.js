const { create_dist } = require("./utils");
const path = require("path");
const fs = require("fs");
const helpers = require("./helpers");

const distFolder = process.env.DIST_FOLDER || "build";

// function loadContent(entryFile) {
function loadContent() {
  create_dist(distFolder);

  const entryFile = path.join(".", "src", "index.tsx");
  // const entryFileContent = fs.readFileSync(entryFile, "utf8");
  // console.log(entryFileContent);

  // console.log("File imports elements");
  // console.log(helpers.getFileImportsElements(entryFileContent));

  // console.log("Imports Statements:");
  // console.log(helpers.getImportStatements(entryFileContent));

  // console.log("Imports Path:");
  // console.log(helpers.getImportsPath(entryFileContent));

  // TEST
  // #1 - Load imported files content
  // NOTE: Fazer isso recursivo, carregando o conteudo de todos os arquivos
  // e fazer todo o processo de carga dnv

  /**
   * To be like:
   *
   * ```ts
   * [
   *    {
   *      filePath: "file/path/ModuleFile.tsx",
   *      filesToImport: [
   *                        "path/to/import/ModuleFile1.tsx",
   *                        "path/to/import/ModuleFile2.tsx",
   *                     ]
   *    },
   *    {...}
   *    {...}
   * ]
   * ```
   *
   * Then, load files in a unique bundle, filtering to not add duplicated content
   */
  let contentOrderer = [];
  let processedFiles = [];
  let orderedFilesToImport = [entryFile];
  const processFileSchema = (filePath, parentPath) => {
    console.log("\n\n");
    console.log("Processando:", filePath, "||", parentPath);
    let parentFolder = ".";
    if (filePath) {
      const parentPathParts = filePath.split("/");
      parentPathParts.pop();
      parentFolder = parentPathParts.join("/");
      console.log("BATI:", parentFolder);
    }
    // console.log("FIUUUU:", parentFolder, filePath);

    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileImportsPath = helpers.getImportsPath(fileContent);
    const currentFileSchema = {
      filePath: filePath,
      filesToImport: [],
    };
    fileImportsPath.forEach((importPath) => {
      // Usa src para inicio ou o caminho do pai do arquivo sendo processado atualmente
      let importedFileContentPath = path.join(
        // parentPath ? "src" : ".",
        // parentPath || "src",
        parentFolder,

        importPath,
      );
      console.log("====>", parentFolder, importPath, importedFileContentPath);
      importedFileContentPath = helpers.getFilePathWithType(
        importedFileContentPath,
      );

      if (!processedFiles.includes(importedFileContentPath)) {
        if (importedFileContentPath) {
          currentFileSchema.filesToImport.push(importedFileContentPath);
          orderedFilesToImport.push(importedFileContentPath);
        } else {
          console.log(
            `${filePath} -> Arquivo dependente nao encontrado: ${importPath}`,
          );
        }

        processedFiles.push(importedFileContentPath);
      }
    });

    // Push current schema result
    contentOrderer.push(currentFileSchema);

    // Recursividade
    // console.log("RECURSIVIDADE:");
    currentFileSchema.filesToImport.forEach((fileToImport) => {
      // console.log(fileToImport);
      processFileSchema(fileToImport, currentFileSchema.filePath);
    });
  };
  processFileSchema(entryFile);

  console.log("Content Orderer:");
  console.log(contentOrderer);

  // NOTE
  /**
   * Se essa ordem abaixo nao funcionar, mudar a hierarquia de carga pra carregar
   * linearmente todo os items do arquivo sendo processado.
   */
  console.log("\n\n");
  console.log("Ordered Files to Import:");
  console.log(orderedFilesToImport.reverse());

  // console.log(path.join("src", "src/components/", "../../Routes.tsx"));
  // console.log(path.join("src", "src/components/", "../../Routes.tsx"));

  // const importsPath = helpers.getImportsPath(entryFileContent);
  // importsPath.forEach((importPath) => {
  //   let importedFileContentPath = path.join(".", "src", importPath);
  //   importedFileContentPath = helpers.getFilePathWithType(
  //     importedFileContentPath,
  //   );

  //   if (importedFileContentPath) {
  //     const importedFileContent = fs.readFileSync(
  //       importedFileContentPath,
  //       "utf8",
  //     );
  //     console.log(importedFileContent);
  //     return;
  //   }

  //   console.log("Arquivo nao encontrado:", importedFileContentPath);
  // });

  // # remove all spaces
  // regexp: /\s/g

  // # PEGA TUDO ENTRE import e from
  // ex: { AppBackground, AppContainer }
  // console.log(entryFileContent.match(/(?<=import)(.*?)(?=from)/gm));

  // # REMOVE TODAS AS CARACTERES ESPECIAIS
  // console.log(
  //   entryFileContent.replaceAll(/[^0-9A-záéíóúàèìòùâêîôûãõç\s]/gm, ""),
  // );

  // const foundItems = entryFileContent.match(/(?<=import)(.*?)(?=from)/gm);
  // console.log(foundItems);

  // # PEGA TODO O IMPORT DE MENOS O FINAL
  // ex: import { AppBackground, AppContainer } from
  // console.log("C", entryFileContent.match(/(import)(.*?)(from)/gs));

  // 1 - Detectar os imports
  // 2 - Carregar o conteúdo dos import de forma recursiva, entrando
  // em arquivo após arquivo para importar tudo

  // OBS: Como renomear arquivos que usam o mesmo nome ?
  // Criando talvez um metodo referencias?
  // tipo:
  // MyConst_1 = MyConst {}
  // MyConst_2 = ...

  // 1o arquivo fica com nome original (Row)
  // 2o arquivo troca o nome: ex: Row_0 cria referencia
  // const components_UI_Row = ()

  // OBS: aparentemente já é assim que funciona :/
  // ----- compilador idea 2 (ainda com conflito de arquivos)
  // 1 - carrega todos os arquivos e guarda num array cada um
  // 2 - cria um array novo para colocar a sequencia dos arquivos
  // 3 - ler o arquivo entryPoint e começa a buscar os arquivos que tenha
  // o primeiro recurso do import (so o primeiro ja resolve pq tem que carregar)
  // o arquivo todo. Coloca esse arquivo no array final
  // 3.3 - se esse arquivo tiver outras dependencias, colocar eles acima tbm
}

module.exports = {
  loadContent,
};
