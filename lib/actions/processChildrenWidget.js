const {
  getHtmlElementName,
  convertObjectToArray,
  removeLastLineFromText,
} = require("../helpers");
const extractJSXChildren = require("../parsers/extractJSXChildren");
const extractJSXElements = require("../parsers/extractJSXElements");
const extractPropsFromJSX = require("../parsers/extractPropsFromJSX");
const extractTopLevelJSXElements = require("../parsers/extractTopLevelJSXElements");
const replaceJSXElement = require("../parsers/replaceJSXElement");

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
const processChildrenWidget = (htmlContent, fileSchemas) => {
  console.log("WIDGETS =========");
  console.log("CHILD htmlContent:", htmlContent);
  const componentElements = extractTopLevelJSXElements(htmlContent);
  console.log("CHILD elements:", componentElements);
  const finalElements = [];

  // Pega cada elemnto JSX dentro do htmlContent
  componentElements.forEach((htmlElement) => {
    const componentElementName = getHtmlElementName(htmlElement);
    console.log("CHILD: element name:", componentElementName);

    // Evita processar um elemento mais de uma vez
    // if (!processedFiles.includes(componentElementName)) {
    //   processedFiles.push(componentElementName);

    const componentSchema = fileSchemas.find(
      (item) => item.widgetName === componentElementName,
    );

    // Processa o arquivo como Widget apenas se for achado na lista de schemas e
    // for um componente stateful
    if (componentSchema && !componentSchema.isModule) {
      let childProps = extractPropsFromJSX(htmlElement);
      console.log("CHILD: props:", childProps);

      let childChildren = extractJSXChildren(htmlElement);
      console.log("CHILD: children:", childChildren);
      // Se tiver child dentro deste child (childChildren), chama essa mesma função recursivamente
      // TODO:
      if (childChildren) {
        // childChildren = processChildrenWidget(childChildren, fileSchemas);
        childProps = { ...childProps, children: childChildren };
      }

      const importItemPropsStringSequence =
        convertObjectToArray(childProps).join(",");
      console.log("CHILD: array props joint:", importItemPropsStringSequence);

      htmlElement = `const TempMethod = () => { return ${htmlElement} \n}`;
      console.log("CHILD: html element Babel bundle:", htmlElement);

      htmlElement = replaceJSXElement(
        htmlElement,
        componentElementName,
        0,
        `<Widget loading=" " code={props.alem.componentsCode.${componentElementName}} props={{ ...({${importItemPropsStringSequence ? `${importItemPropsStringSequence},` : ""} ...props}) }} />`,
      );

      // Remove method and last line
      htmlElement = htmlElement.replace(
        "const TempMethod = () => {return ",
        "",
      );

      console.log("CHILD: converted to widget:", htmlElement);

      htmlElement = removeLastLineFromText(htmlElement);
      htmlElement = removeEndCharacter(htmlElement, "\n");
      htmlElement = removeEndCharacter(htmlElement, ";");

      // TODO: talvez tenha que remover o ";" no final

      console.log("CHILD: converted to widget:", htmlElement);
      // htmlContent.push(htmlContent);
      // }
    }

    finalElements.push(htmlElement);
  });

  // Filtra o array final para ter somente os items presentes no
  // array de elementos iniciais + Widgets.

  console.log("CHILD Elements:", componentElements);
  console.log("CHILD Final Elements:", finalElements);
  console.log("\n");

  const finalChildrenHtmlContent = `<>\n${finalElements.join("\n")}\n</>`;
  console.log("FINAL:", finalChildrenHtmlContent);
  return finalChildrenHtmlContent;
};

module.exports = processChildrenWidget;
