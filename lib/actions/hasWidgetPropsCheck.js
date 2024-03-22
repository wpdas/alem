const { removeComments } = require("../parse");
const { WIDGET_PROPERTIES } = require("../regexp");

/**
 * Verifica se existem propriedades de widget no arquivo.
 * Widget properties to check: useState, useEffect, State.init
 * @param {string} fileContent
 */
const hasWidgetPropsCheck = (fileContent) => {
  const content = removeComments(fileContent);
  return !!content.match(WIDGET_PROPERTIES);
};

module.exports = hasWidgetPropsCheck;
