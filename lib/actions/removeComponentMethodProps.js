const { GET_SECOND_WORD } = require("../regexp");

/**

 * @param {string} componentMethodContent
 */
const removeComponentMethodProps = (componentMethodContent) => {
  let methodName = componentMethodContent.match(GET_SECOND_WORD)[1];
  return `const ${methodName} = () => {`;
};

module.exports = removeComponentMethodProps;
