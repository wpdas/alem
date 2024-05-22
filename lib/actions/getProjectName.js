const { read_alem_config } = require("../config");

/**
 * Get the project name based on configuration
 * @returns
 */
const getProjectName = (skipCheckers = false) => {
  const appConfig = read_alem_config();
  let projectName = appConfig.name.replaceAll(" ", "-").toLowerCase();

  // Se ignorar a checagem do nome final do projeto
  if (skipCheckers) {
    return projectName;
  }

  projectName = appConfig.isIndex ? "Index" : projectName;
  return appConfig.options?.createLoaderWidget
    ? `${projectName}Loader`
    : projectName;
};

module.exports = getProjectName;
