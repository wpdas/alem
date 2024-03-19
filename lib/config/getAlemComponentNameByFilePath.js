const alemComponentsPartOfPath = {
  RouteLink: "/lib/alem-vm/components/RouteLink.tsx",
  Routes: "/lib/alem-vm/components/RouteLink.tsx",
};

/**
 * Checa se o "filePath" faz parte de algum componente do Alem
 * @param {string} filePath file path to check
 */
const getAlemComponentNameByFilePath = (filePath) => {
  let alemComponentName = null;
  Object.keys(alemComponentsPartOfPath).forEach((componentNameKey) => {
    if (filePath.includes(componentNameKey) && !alemComponentName) {
      alemComponentName = componentNameKey;
      return;
    }
  });

  return alemComponentName;
};

module.exports = getAlemComponentNameByFilePath;

// TODO: Provavelmente remover isso
