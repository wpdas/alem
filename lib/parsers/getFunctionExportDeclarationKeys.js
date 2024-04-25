const transformAndGetFunctionExportDeclarations = require("./transformAndGetFunctionExportDeclarations");

/**
 * Retorna a chave/nome de declaração de todas as declarações sendo exportadas no arquivo.
 * @param {*} code
 * @returns
 */
const getFunctionExportDeclarationKeys = (code) => {
  const declarations = transformAndGetFunctionExportDeclarations(code);
  // console.log("RESULTADO:");
  // console.log(declarations);
  // console.log("\n");

  return Object.keys(declarations);
};

module.exports = getFunctionExportDeclarationKeys;
