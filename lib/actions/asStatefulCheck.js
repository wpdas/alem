const { removeBlankLines } = require("../parse");

/**
 * Checa se a assinatura "as stateful" foi encontrado no topo do arquivo.
 * @param {*} content
 * @returns
 */
const asStatefulCheck = (content) => {
  // NOTE: Checa se tem "as stateful", se tiver, deve ser tratado como um Widget/Stateful
  const hasAsStatefulType = content.includes('"as stateful"');

  if (hasAsStatefulType) {
    content = content.replace('"as stateful";', "");
    content = content.replace('"as stateful"', "");

    return {
      updatedContent: removeBlankLines(content),
      asStatefulSignalFound: true,
    };
  }

  return {
    updatedContent: content,
    asStatefulSignalFound: false,
  };
};

module.exports = asStatefulCheck;
