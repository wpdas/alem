/**
 * Troca os recursos do Alem importados para usar o props.alem.<recurso>
 * @param {string} bundleContent
 */
const parseAlemFeatures = (bundleContent) => {
  return bundleContent
    .replaceAll("createStore(", "props.alem.createStore(")
    .replaceAll("useStore(", "props.alem.useStore(")
    .replaceAll("clearStore(", "props.alem.clearStore(")
    .replaceAll("clearStore(", "props.alem.clearStore(")
    .replaceAll("loadExternalStyles(", "props.alem.loadExternalStyles(")
    .replaceAll("useParams(", "props.alem.useParams(")
    .replaceAll("useLocation(", "props.alem.useLocation(")
    .replaceAll("createRoute(", "props.alem.createRoute(");
};

module.exports = parseAlemFeatures;
