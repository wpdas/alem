const {
  getHtmlElementName,
  convertObjectToArray,
  removeLastLineFromText,
} = require("../helpers");
const extractJSXChildren = require("../parsers/extractJSXChildren");
const extractPropsFromJSX = require("../parsers/extractPropsFromJSX");
const extractTopLevelJSXElements = require("../parsers/extractTopLevelJSXElements");
const replaceJSXElement = require("../parsers/replaceJSXElement");
const getProjectName = require("./getProjectName");

/**
 * Usado para remover o endChar do texto se o endChar for a última caractere no texto
 * @param {*} text
 * @param {*} endChar
 * @returns
 */
function removeEndCharacter(text, endChar) {
  // Verifica se o último caractere do texto é um ponto e vírgula
  if (text.endsWith(endChar)) {
    // Retorna o texto sem o último caractere
    return text.slice(0, -1);
  }
  // Retorna o texto original se o último caractere não for um ponto e vírgula
  return text;
}

/**
 * Processa Widgets para children de cada elemento.
 *
 * Isso deve ser feito para dar maior suporte à troca de Widgets dentro do conteúdo.
 * Como agora componentes stateful e stateless suportam children, os elementos devem
 * ser trocados antes de serem enviados como parametro
 *
 * @param {string} htmlContent
 */
const processChildrenWidget = (htmlContent, fileSchemas, account) => {
  const componentElements = extractTopLevelJSXElements(htmlContent);
  const finalElements = [];

  // Pega cada elemnto JSX dentro do htmlContent
  componentElements.forEach((htmlElement) => {
    const componentElementName = getHtmlElementName(htmlElement);

    const componentSchema = fileSchemas.find(
      (item) => item.widgetName === componentElementName,
    );

    // Processa o arquivo como Widget apenas se for achado na lista de schemas e
    // for um componente stateful
    if (componentSchema && !componentSchema.isStateless) {
      const extractPropsResult = extractPropsFromJSX(htmlElement);
      let childProps = extractPropsResult.keyValueProps;
      const childSpreads = extractPropsResult.spreads;

      let childChildren = extractJSXChildren(htmlElement);
      // INFO: Se tiver child dentro deste child (childChildren), chama essa mesma função recursivamente?
      // ja esta sendo feito pelo "transformSchemaToWidgets"
      if (childChildren) {
        childProps = { ...childProps, children: childChildren };
      }

      let importItemPropsStringSequence =
        convertObjectToArray(childProps).join(",");

      // Adiciona os spreads junto com as propriedades do elemento JSX. Ex:
      // <Widget code="..." {...{foo: 2, bar: "oi", ...mySpread1, ...mySpread2}}
      // no caso os spreads sao: ...mySpread1 e ...mySpread2
      if (childSpreads.length > 0) {
        importItemPropsStringSequence += `${importItemPropsStringSequence.length > 0 ? "," : ""} ${childSpreads.join(",")}`;
      }

      htmlElement = `const TempMethod = () => { return ${htmlElement} \n}`;

      if (componentSchema.toBeEjected) {
        // O nome do projeto deve vir na frente para evitar conflitos com outros
        // aplicativos publicados na mesma conta
        const newWidgetName = `${getProjectName(true)}.${componentElementName}`;
        const src = `"${account}/widget/${newWidgetName}"`;

        htmlElement = replaceJSXElement(
          htmlElement,
          componentElementName,
          0,
          `<Widget loading=" " src={${src}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }} />`,
        );
      } else {
        htmlElement = replaceJSXElement(
          htmlElement,
          componentElementName,
          0,
          `<Widget loading=" " code={props.alem.componentsCode.${componentElementName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }} />`,
        );
      }

      // htmlElement = replaceJSXElement(
      //   htmlElement,
      //   componentElementName,
      //   0,
      //   `<Widget loading=" " code={props.alem.componentsCode.${componentElementName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }} />`,
      // );

      // Remove method and last line
      htmlElement = htmlElement.replace(
        "const TempMethod = () => {return ",
        "",
      );

      htmlElement = removeLastLineFromText(htmlElement);
      htmlElement = removeEndCharacter(htmlElement, "\n");
      htmlElement = removeEndCharacter(htmlElement, ";");
    }

    finalElements.push(htmlElement);
  });

  // Filtra o array final para ter somente os items presentes no
  // array de elementos iniciais + Widgets.

  const finalChildrenHtmlContent = `<>\n${finalElements.join("\n")}\n</>`;
  return finalChildrenHtmlContent;
};

module.exports = processChildrenWidget;
