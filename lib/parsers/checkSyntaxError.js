const fs = require("fs");
const babel = require("@babel/core");
const presetReactPath = require("./presetReactPath");
const presetTypescriptPath = require("./presetTypescriptPath");

/**
 * Checa a estrutura de arquivos .tsx e .jsx para ver se a estrutura está correta.
 * Caso não esteja, impede de o compilador ir adiante e retorna a mensagem de erro.
 * @param {string} filePath
 */
function checkSyntaxError(filePath) {
  let error = null;

  const code = fs.readFileSync(filePath, { encoding: "utf8" });

  if (!code) {
    console.error(`Erro ao ler o arquivo ${filePath}`);
    return;
  }

  try {
    // Tentativa de análise do código
    babel.parseSync(code, {
      presets: [presetReactPath, presetTypescriptPath],
      filename: filePath,
    });
    // console.log(`Nenhum erro de sintaxe detectado em ${filePath}.`);
  } catch (syntaxError) {
    // Captura e exibe erros de sintaxe
    error = syntaxError.message;
    // console.error(
    //   `Erro de sintaxe detectado em ${filePath}:`,
    //   syntaxError.message,
    // );
  }

  return error;
}

module.exports = checkSyntaxError;
