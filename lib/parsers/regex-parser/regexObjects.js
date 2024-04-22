let _regexObjects = {};

/**
 * INFO: Houve a tentativa de guardar as referencias das expressoes no estado global, porém a VM não suporta
 * passar expressoes regulares como parametros para os Widgets abaixo
 */
// function convertRegexStringsToLiterals(obj) {
//   const entries = Object.keys(obj);
//   let finalObjects = "";

//   entries.forEach((key) => {
//     const currentEntrieValue = obj[key];
//     let currentRegexString = `${key}: ${currentEntrieValue}`;
//     finalObjects += `${currentRegexString},\n`;
//   });

//   return finalObjects;
// }

const addExpressions = (expressions) =>
  (_regexObjects = { ..._regexObjects, ...expressions });
const getExpressions = () => _regexObjects;
// const getStringExpressions = () => convertRegexStringsToLiterals(_regexObjects);

module.exports = {
  addExpressions,
  getExpressions,
  // getStringExpressions,
};
