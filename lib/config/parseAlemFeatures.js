/**
 * Troca os recursos do Alem importados para usar o props.alem.<recurso>
 * @param {string} bundleContent
 */
const parseAlemFeatures = (bundleContent) => {
  return bundleContent
    .replaceAll("loadExternalStyles(", "props.alem.loadExternalStyles(")
    .replaceAll("useParams(", "props.alem.useParams(")
    .replaceAll("createRoute(", "props.alem.createRoute(")
    .replaceAll("promisify(", "props.alem.promisify(")
    .replaceAll("isDevelopment", "props.alem.isDevelopment");
};

module.exports = parseAlemFeatures;
