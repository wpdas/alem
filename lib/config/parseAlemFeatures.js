/**
 * Troca os recursos do Alem importados para usar o props.alem.<recurso>
 * @param {string} bundleContent
 */
const parseAlemFeatures = (bundleContent) => {
  return (
    bundleContent
      .replaceAll("loadExternalStyles(", "props.alem.loadExternalStyles(")
      .replaceAll("useParams(", "props.alem.useParams(")
      .replaceAll("createRoute(", "props.alem.createRoute(")
      .replaceAll("promisify(", "props.alem.promisify(")

      // Routes
      .replaceAll("getLocation(", "props.alemRoutes.getLocation(")
      .replaceAll("navigate(", "props.alemRoutes.navigate(")
  );
};

module.exports = parseAlemFeatures;
