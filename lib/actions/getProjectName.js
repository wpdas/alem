const { read_alem_config } = require("../config");

/**
 * Get the project name
 * @returns
 */
const getProjectName = () => {
  const appConfig = read_alem_config();
  let projectName = appConfig.name.replaceAll(" ", "-").toLowerCase();
  projectName = appConfig.isIndex ? "Index" : projectName;
  return appConfig.options?.createLoaderWidget
    ? `${projectName}Loader`
    : projectName;
};

module.exports = getProjectName;
