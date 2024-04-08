/**
 * Experimental: Gera uma estrutura entendível pelo Near VM a partir de um await
 * @param {string} code
 * @returns
 */
function transformAsyncAwait(code) {
  // Primeiro, remove 'async ' de todas as funções
  let transformedCode = code.replace(/async /g, "");

  // Regex ajustada para capturar chamadas de função que abrangem múltiplas linhas
  const pattern = /const (\w+) = await (.*?);/gs;

  // Função para gerar o novo bloco de código substituto
  function replaceWithPromisify(match, varName, asyncCall) {
    // Removendo espaços em branco extras e quebras de linha do início e do fim do asyncCall
    asyncCall = asyncCall.replace(/^\s+|\s+$/g, "");
    return `let ${varName} = state.${varName};
  if (!${varName}) {
    promisify(
      () => ${asyncCall},
      (data) => State.update({ ${varName}: data }),
      () => State.update({ ${varName}: null }),
    );

    return "";
  }`;
  }

  // Realizando a substituição no código transformado
  transformedCode = transformedCode.replace(pattern, replaceWithPromisify);

  return transformedCode;
}

module.exports = transformAsyncAwait;
