const { getFunctionItemsBetweenParenthesis } = require("../helpers");

/**
 *
 * @param {string} componentMethodContent
 * @param {[]} dependencies
 */
const addDependenciesToComponentMethod = (
  componentMethodContent,
  dependencies,
) => {
  let result = "";

  // Varre items para ver se ja não estao inclusos na linha
  let parenthesisContent = getFunctionItemsBetweenParenthesis(
    componentMethodContent,
  );

  // console.log("=TEXTO=", componentMethodContent);
  // console.log("ENTRE PARENTESIS:", parenthesisContent);

  // Filtra: remove itens da dependencia que já estao presentes nos parentesis do método
  const filteredDependencies = dependencies.filter(
    (item) => !parenthesisContent.includes(item),
  );
  console.log("FILTRADO:", filteredDependencies);

  // Existe "({" ?
  if (filteredDependencies.length > 0) {
    if (componentMethodContent.indexOf("({")) {
      result = componentMethodContent.replace(
        "({",
        // Adiciona dependencias e uma virgula no final se tiver mais elementos na frente
        `({${filteredDependencies}${parenthesisContent.length > 0 ? "," : ""}`,
      );
      // Então é "("
    } else {
      result = componentMethodContent.replace(
        "(",
        // Adiciona dependencias e uma virgula no final se tiver mais elementos na frente
        `(${filteredDependencies}${parenthesisContent.length > 0 ? "," : ""}`,
      );
    }
  }
  // console.log("DEPENDENCIES:", dependencies);
  // console.log("FILTRADO DEPENDENCIES:", filteredDependencies);
  // console.log("RESULT ====>:", result);
  // console.log("\n\n");
  return result;
};

module.exports = addDependenciesToComponentMethod;
