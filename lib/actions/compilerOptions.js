const path = require("path");
const { read_alem_config } = require("../config");

/**
 * Trata as configurações do compilador na qual o usuário pode definir os valores.
 * Ver arquivo alem.config.json -> compilerOptions
 * @param {*} config
 * @returns
 */
function getConfiguredPaths(config) {
  if (!config.compilerOptions || !config.compilerOptions.paths) {
    return {};
  }

  const pathsConfig = config.compilerOptions.paths;
  const basePath = config.compilerOptions.baseUrl;

  // Resolvendo caminhos absolutos e mantendo os relativos
  const resolvedPaths = Object.keys(pathsConfig).reduce((acc, key) => {
    // Assume que todos os paths terminam com "/*", indicando um diretório
    const relativePath = pathsConfig[key].replace("/*", "");
    const absolutePath = path.resolve(process.cwd(), basePath, relativePath);

    // Adicionando tanto caminho absoluto quanto relativo no objeto de retorno
    acc[key] = {
      absolute: absolutePath + "/",
      relative: path.join(basePath, relativePath),
    };

    return acc;
  }, {});

  return resolvedPaths;
}

const compilerOptions = () => {
  const config = read_alem_config();
  const paths = getConfiguredPaths(config);

  return {
    paths,
  };
};

const { paths } = compilerOptions();
const pathsKeys = Object.keys(paths);
const replacePathAlias = (path) => {
  pathsKeys.forEach((pathAlias) => {
    //ex: path includes @app
    if (path.includes(pathAlias)) {
      path = path.replace(pathAlias, paths[pathAlias].relative);
    }
  });

  return path;
};

/**
 * Check if path is using path alias
 *
 * ex: @app/foo/bar => return true because of "@app" (if available inside alem.config.json -> compilerOptions)
 * @param {string} path
 * @returns
 */
const hasPathAlias = (path) => {
  let includes = false;
  pathsKeys.forEach((pathAlias) => {
    //ex: path includes @app
    if (path.includes(pathAlias) && !includes) {
      includes = true;
    }
  });

  return includes;
};

module.exports = {
  compilerOptions,
  replacePathAlias,
  hasPathAlias,
};
