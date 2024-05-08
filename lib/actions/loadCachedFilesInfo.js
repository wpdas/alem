const path = require("path");
const fs = require("fs");
const handleNames = require("./handleNames");
const loadFilesInfo = require("./loadFilesInfo");
const replaceIdentifierInCode = require("../parsers/replaceIdentifierInCode");
const checkSyntaxError = require("../parsers/checkSyntaxError");
const checkForWildcardImports = require("../parsers/checkForWildcardImports");

/**
 * Gera um esquema com os arquivos sendo importados no projeto a partir de um ponto de entrada
 * @param {*} changedFilePath
 * @returns
 */
const loadCachedFilesInfo = (changedFilePath) => {
  // TODO: testar o erro que acontece quando um arquivo é removido do import
  let hasError = null;
  const filesInfoRaw = fs.readFileSync(path.join(`./build/filesInfo.json`));
  const filesInfo = JSON.parse(filesInfoRaw);
  const changedFileSchema = loadFilesInfo(changedFilePath, true).fileSchemas[0];
  console.log("FILE:", changedFilePath);

  // Verifica cada arquivo jsx e ts para ver se estão quebrados ou não.
  hasError = checkSyntaxError(changedFilePath);
  if (hasError) {
    return {
      hasError,
      fileSchemas: filesInfo,
    };
  }

  hasError = checkForWildcardImports(changedFilePath);
  if (hasError) {
    return {
      hasError,
      fileSchemas: filesInfo,
    };
  }

  // Verifica se o arquivo existe na lista de esquemas. Se for um arquivo novo, ele
  // deve ser adicionado primeiro
  const fileExists = filesInfo.find(
    (fileInfo) => fileInfo.filePath === changedFilePath,
  );
  // console.log("O arquivo solicitado existe?", fileExists);
  if (!fileExists) {
    // Se nao existir o arquivo no esquema, adiciona-o
    filesInfo.push(changedFileSchema);
  }

  // Pega os exports dos arquivos que esse arquivo alterado depende. Isso vai ser usado
  // para mudar o nome deles dentro deste arquivo alterado.
  let changedFileImportsName = {};

  changedFileSchema.toImport.forEach((toImportFile) => {
    // ex: toImportFile = caminho/arquivo/file.ts
    let toImportSchemaRef = filesInfo.find(
      (fileInfo) => fileInfo.filePath === toImportFile,
    );

    // Se o arquivo ainda não existe na lista de esquemas, adiciona-o. Isso pode acontecer
    // quando um novo arquivo é adicionado no processo de desenvolvimento
    // console.log("Existe arquivo de dependencia/import?", !!toImportSchemaRef);
    if (!toImportSchemaRef) {
      // Se nao existir o arquivo no esquema, processa ele para tratar tudo (como nomes)
      // Depois adiciona-o à lista de filesInfo
      // INFO: recursividade
      const updatedFileSchemasCall = loadCachedFilesInfo(toImportFile);
      hasError = updatedFileSchemasCall.hasError;

      // Se tiver erro desse processo recursivo, nao segue em frente
      if (hasError) return;

      const updatedFileSchemasWithImportSchema =
        updatedFileSchemasCall.fileSchemas;
      toImportSchemaRef = updatedFileSchemasWithImportSchema.find(
        (fileSchema) => fileSchema.filePath === toImportFile,
      );
      filesInfo.push(toImportSchemaRef);
    }

    // Se nenhum erro foi encontrado até aqui...
    if (!hasError) {
      // Atualiza a lista de imports com seu nome original ou alterado
      changedFileImportsName = {
        ...changedFileImportsName,
        ...toImportSchemaRef.exports,
      };
    }
  });

  if (hasError) {
    return {
      hasError,
      fileSchemas: filesInfo,
    };
  }

  // console.log("\n");
  // console.log("IMPORTS NAME:", changedFileImportsName);
  // console.log("\n");

  const changedFileImportsNameEntries = Object.entries(changedFileImportsName);
  changedFileImportsNameEntries.forEach((entry) => {
    changedFileSchema.content = replaceIdentifierInCode(
      changedFileSchema.content,
      entry[0],
      entry[1],
    );
  });

  // Lista de nomes ja usados nos exports
  const previousTakenNames = [];

  // Muda o esquema do arquivo alterado na estrutura geral de esquemas
  let changedFileIndex = 0;
  const updatedFilesInfo = filesInfo.map((fileInfo, index) => {
    if (fileInfo.filePath === changedFilePath) {
      changedFileIndex = index;
      // console.log("Encontrado:", fileInfo);

      // Registra o nome anterior dos items sendo exportados para que eles
      // possam ser usados na troca de nomes posteriormente
      // Exemplo, se "Button" foi mudado para "A_14", logo, agora ele deve ter o nome
      // "A_14" para que os arquivos que o receberam com esse nome possam ser atualizados
      // com o novo novo nome que esse item receberá após ser editado. Sim, o valor sempre
      // será diferente porque a função que cria novos nomes sempre é incrementada
      // Isso será feito dentro do "handleNamesForChangedFile" -> "replaceNamesInContent"
      changedFileSchema.previousExports = fileInfo.exports;

      return changedFileSchema;
    }

    // Aproveita esse loop para registrar os nomes de exports ja usados
    // INFO: pula se for o mesmo arquivo alterado
    const fileExportsNamesEntries = Object.entries(fileInfo.exports).map(
      (entry) => entry[1],
    );
    previousTakenNames.push(...fileExportsNamesEntries);

    // Retorna o fileInfo ja existente que não é o arquivo alterado
    return fileInfo;
  });

  // console.log("\n");
  // console.log("TAKEN NAMES:", previousTakenNames);
  // console.log("\n");

  // console.log("CHANGED FILE SCHEMA:", updatedFilesInfo[changedFileIndex]);

  // Handle names -> remove const duplicates
  const contentOrderer = handleNames.handleNamesForChangedFile(
    updatedFilesInfo,
    changedFileSchema,
    changedFileIndex,
    previousTakenNames,
  );

  return {
    hasError,
    fileSchemas: contentOrderer,
  };
};

module.exports = loadCachedFilesInfo;
