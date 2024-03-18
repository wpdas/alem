// TODO: Achar uma forma melhor de injetar os componentes do Alem?

const path = require("path");
// const transformFileToFileSchema = require("../actions/transformFileToFileSchema");
const loadFilesContent = require("../actions/loadFilesContent");
const { ALEM_VM_FOLDER } = require("../contants");
const loadFilesInfo = require("../actions/loadFilesInfo");

// Components
// const routesSchema = transformFileToFileSchema(
//   path.join(__dirname, ALEM_VM_FOLDER, "components", "Routes.tsx"),
// );
const routesDir = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "components",
  "Routes.tsx",
);
const routesSchema = loadFilesInfo(routesDir).fileSchemas[0];

const routeLinkDir = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "components",
  "RouteLink.tsx",
);
const routeLinkSchema = loadFilesInfo(routeLinkDir).fileSchemas[0];

// const routeLinkSchema = transformFileToFileSchema(
//   path.join(__dirname, ALEM_VM_FOLDER, "components", "RouteLink.tsx"),
// );

const alemComponentsCodesAndSchemas =
  loadFilesContent.loadComponentCodesObjectByFileSchemas([
    routesSchema,
    routeLinkSchema,
  ]);

/**
 * Final Schemas for Alem components
 *
 * Devem ser incluídos no schema de processamento global dos arquivos porque eles podem usá-los
 */
const alemWidgetsSchemas = alemComponentsCodesAndSchemas.completeFileSchemas;

module.exports = {
  alemWidgetsSchemas,
};

// TODO: Remover, apagar tudo
