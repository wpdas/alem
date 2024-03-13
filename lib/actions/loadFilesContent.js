const { process_file, process_file_content } = require("../parse");
const transformSchemaToWidget = require("./transformSchemaToWidget");

// Load App Files Content based on files schema
// const loadFilesContent = (orderedFilesToImport) => {
//   let bundleFile = "";
//   orderedFilesToImport.forEach((filePath) => {
//     bundleFile += process_file(filePath);
//   });

//   return bundleFile;
// };

/**
 * Load files based on the filePath sequence
 */
// const loadFilesContent = (filesToLoad) => {
//   let bundleFile = "";
//   filesToLoad.forEach((filePath) => {
//     bundleFile += process_file(filePath);
//   });

//   return bundleFile;
// };

/**
 * (Recommended)
 * Load files based on the fileSchemas sequence
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
// const loadFilesContentByFileSchemas = (fileSchemas) => {
//   let bundleFile = "";
//   // Reverse sequence to load the deepest first
//   fileSchemas = fileSchemas.reverse();
//   fileSchemas.forEach((fileSchema) => {
//     const transpileTypescript =
//       fileSchema.filePath.endsWith(".ts") ||
//       fileSchema.filePath.endsWith(".tsx");
//     bundleFile += process_file_content(fileSchema.content, transpileTypescript);
//   });

//   return bundleFile;
// };

/**
 * (Recommended)
 * Load files based on the fileSchemas sequence
 * @param {{filePath: string, toImport: string[], content: string}[]} fileSchemas
 */
const loadFilesContentByFileSchemas = (fileSchemas) => {
  let bundleFile = "";
  // Reverse sequence to load the deepest first
  fileSchemas = fileSchemas.reverse();

  // Get Normal js files & Widget files (components transformed to BOS Widgets)
  const completeFileSchemas = transformSchemaToWidget(fileSchemas);

  completeFileSchemas.forEach((fileSchema) => {
    if (
      fileSchema.filePath.endsWith(".tsx") ||
      fileSchema.filePath.endsWith(".jsx")
    ) {
      console.log(fileSchema.filePath);
      console.log(fileSchema.finalFileBundle);
      console.log("\n\n");
    }

    bundleFile += fileSchema.finalFileBundle;
  });

  return bundleFile;
};

/**
 * NOTE: Esse modelo joga as dependencias pra cima
 */
// const loadFilesContentSendingImportsToTheTop = (filesSchema) => {
//   let bundleFile = "";

//   // 1 - carrega o "filePath"
//   // 2 - carrega os arquivos "toImport" acima do "filePath"
//   // 3 - verificar se o conteúdo já nao existe antes de adicionar
//   // se existir, ignora a adicao
//   // 4 - Se conteudo já existir e estiver abaixo do "filePath", remove ele
//   // e tras pra cima

//   const addContent = (content) => {
//     if (!bundleFile.includes(content)) {
//       bundleFile = `
//       ${content}

//       ${bundleFile}
//       `;
//     }
//   };

//   filesSchema.forEach((fileSchema) => {
//     const filePathContent = process_file(fileSchema.filePath);
//     addContent(filePathContent);

//     // Adiciona os "toImport" deste File Schema
//     fileSchema.toImport.forEach((dependencyFilePath) => {
//       const dependentFileContent = process_file(dependencyFilePath);

//       // Checa se o conteudo dependente já existe e se esta acima do elemento
//       // pai (filePath), se estiver embaixo, manda pra cima
//       const filePathPosition = bundleFile.indexOf(filePathContent);
//       const dependentPosition = bundleFile.indexOf(dependentFileContent);

//       // Se existir tanto um quanto outro...
//       if (filePathPosition > 0 && dependentPosition > 0) {
//         // Se o dependent estiver abaixo do filePathContent
//         if (dependentPosition > filePathPosition) {
//           // Remove o dependente do conteudo do bundle
//           // Ele vai ser adicionado dnv no "addContent" abaixo, só que
//           // acima do arquivo "filePath"
//           bundleFile.replace(dependentFileContent, "");
//         }
//       }

//       addContent(dependentFileContent);
//     });
//   });

//   return bundleFile;
// };

module.exports = {
  loadFilesContentByFileSchemas,
};
