/**
 * Organize the sequence of instances and dependencies following an order of dependency.
 *
 * This is to avoid the usage of something before its definition
 */

const fs = require("fs");

const ELEMENT_SPACE_MARKER = ":::SM:::";

function buildSpaceMarker(elementName) {
  return `${ELEMENT_SPACE_MARKER}${elementName}${ELEMENT_SPACE_MARKER}`;
}

function instanceElementExistsInBody(elementName, bundleBody) {
  // Verificar se já tem algum "const/let/var <elementName>" no corpo do arquivo
  // se nao tiver, criar marcador de espaço para este elemento
  // se tiver, apenas ignora

  return Boolean(
    bundleBody.includes(`const ${elementName}`) ||
      bundleBody.includes(`let ${elementName}`) ||
      bundleBody.includes(`var ${elementName}`),
  );
}

/**
 * Vefirica se as instancias dos imports do arquivo já estao presentes dentro do bundleBody, caso não
 * esteja, cria um marcador de espaço para alocar esse conteúdo pendente posteriormente.
 *
 * Isso é importante para manter as instancias na ordem correta e não ocorrer um error onde
 * um recurso é chamado antes de ser implementado.
 * @param {*} file
 * @param {*} fileBundleBody
 * @returns
 */
function checkImportFeatures(file, fileBundleBody) {
  const fileContent = fs.readFileSync(file, "utf8");
  const foundItems = fileContent.match(/(?<=import)(.*?)(?=from)/gm);

  // List de pontos de espaço para inserir os conteúdos pendentes
  let markers = "";

  if (foundItems) {
    foundItems.forEach((item) => {
      // remove spaces and braces
      const filteredItem = item
        .replaceAll(" ", "")
        .replaceAll("{", "")
        .replaceAll("}", "");

      // Check if there are more than one item
      if (filteredItem.includes(",")) {
        const subItems = filteredItem.split(",");
        subItems.forEach((subItem) => {
          if (!instanceElementExistsInBody(subItem, fileBundleBody)) {
            // Insere um marcador de espaço para este elemento
            markers += `
            ${buildSpaceMarker(subItem)}
            `;
          }
        });

        return;
      }

      if (!instanceElementExistsInBody(filteredItem, fileBundleBody)) {
        // Insere um marcador de espaço para este elemento
        markers += `
        ${buildSpaceMarker(filteredItem)}
        `;
      }
    });
  }

  return markers;
}

let listInstancesContent = [];

/**
 * Verifica sem tem marcadores pendentes para as instancias dentro do corpo
 * do arquivo atual, se tiver, coloca o conteúdo deste arquivo no marcador
 * em questão
 * @param {*} fileBody
 * @param {*} bundleBody
 */
function checkFeaturesMarker(fileBody, bundleBody) {
  // Regexp: buscar por palavras depois de const, let e var
  const foundItems = fileBody.match(
    /(?<=\bconst\s)(\w+)|(?<=\blet\s)(\w+)|(?<=\bvar\s)(\w+)/,
  );

  // Checar se possui marcador de espaço para as instancias encontradas
  let hasMarker = false;
  foundItems.forEach((instance) => {
    if (bundleBody.includes(buildSpaceMarker(instance)) && !hasMarker) {
      hasMarker = true;

      listInstancesContent.push({
        instanceName: instance,
        marker: buildSpaceMarker(instance),
        content: fileBody,
      });
    }
  });

  // Se nenhum marcador for encontrado, simplesmente adiciona o conteúdo
  // do arquivo atual ao conteúdo do bundle
  if (!hasMarker) {
    bundleBody += fileBody;
  }

  return bundleBody;
}

/**
 * Troca os marcadores por seu respectivo conteúdo. Também verifica se um conteúdo de outro
 * marcador deve ser colocado acima do marcador sendo tratado no momento.
 *
 * @param {*} bundleBody
 * @returns
 */
function replaceMarkers(bundleBody) {
  const completed = [];

  // Varre a lista de instancias marcadas
  listInstancesContent.forEach((instanceContent, index) => {
    // Para cada marcador, verificar se dentro dele esta sendo usado a outras instancias
    // dentro do "listInstancesContent". Se tiver, coloca primeiro o conteúdo dessa instancia
    // e só depois coloca o conteúdo da instancia atual. Se isso ocorrer, deve-se remover
    // a instancia adicional colocada acima da lista "listInstancesContent"
    let markerContent = "";

    if (!completed.includes(instanceContent.instanceName)) {
      // Verifica sub items
      listInstancesContent.forEach((subInstanceContent, subIndex) => {
        // Se nao for o mesmo item e o item principal tem parte do item secundario...
        if (
          instanceContent.content.includes(subInstanceContent.instanceName) &&
          instanceContent.instanceName !== subInstanceContent.instanceName
        ) {
          // Possui o sub item, coloca o conteúdo do subitem primeiro
          // listInstancesContent[subIndex].done = true;
          completed.push(listInstancesContent[subIndex].instanceName);
          markerContent += listInstancesContent[subIndex].content;
        }
      });

      // Coloca o conteúdo do item principal
      // listInstancesContent[index].done = true;
      completed.push(listInstancesContent[index].instanceName);
      markerContent += listInstancesContent[index].content;

      // Adiciona o conteudo do marcador no corpo do bundle principal
      bundleBody = bundleBody.replace(instanceContent.marker, markerContent);
    }
  });

  // Remove o restante dos marcadores que não foram tratados. Esses possivelmente são
  // de biblitecas, nao de arquivos do projeto
  bundleBody = bundleBody.replaceAll(/(:::SM:::)(.*?)(:::SM:::)/g, "");

  // Reset the markers organizer list
  listInstancesContent = [];

  return bundleBody;
}

module.exports = {
  checkImportFeatures,
  checkFeaturesMarker,
  replaceMarkers,
};
