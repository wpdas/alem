const alemComponentsPath = {
  RouteLink: "node_modules/alem/lib/alem-vm/components/RouteLink.tsx",
  Routes: "node_modules/alem/lib/alem-vm/components/RouteLink.tsx",
};

/**
 * Retornar o caminho relativo do arquivo da qual o componente solicitado está
 * @param {string} componentName  Nome do componente, ex: RouteLink e importSource for "alem", retorna root/node_modules/alem/lib/alem-vm/components/RouteLink.tsx
 * @param {*} importSource
 */
const getAlemComponentsPath = (componentName, importSource) => {
  let componentPath = null;

  if (importSource.includes("alem")) {
    componentPath = alemComponentsPath[componentName] || null;
  }

  return componentPath;
};

module.exports = getAlemComponentsPath;
