const regexObjects = require("../parsers/regex-parser/regexObjects");

/**
 * Troca as referencias de expressoes regulares com elas sendo devidamente escapadas. Isso é necessário
 * pois todas as expressoes encontradas sao extraídas para depois serem realocadas de forma formatada/escapada
 * corretamente no código final.
 *
 * @param {*} bundleContent
 * @returns
 */
const injectFoundRegExps = (bundleContent) => {
  const expressions = regexObjects.getExpressions();
  const exps = Object.keys(expressions);
  exps.forEach((expressionKey) => {
    bundleContent = bundleContent.replaceAll(
      `"${expressionKey}"`,
      expressions[expressionKey],
    );
  });

  return bundleContent;
};

module.exports = injectFoundRegExps;
