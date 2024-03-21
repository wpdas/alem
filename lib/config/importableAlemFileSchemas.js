const path = require("path");
const transformFileToFileSchema = require("../actions/transformFileToFileSchema");
const loadFilesContent = require("../actions/loadFilesContent");
const { ALEM_VM_FOLDER } = require("../contants");

/**
 * Gera e retorna o schema completo dos arquivos importáveis do além.
 * @returns
 */
const importableAlemFileSchemas = () => {
  // ==== Importables ====

  const createContextSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "createContext.ts",
    ),
  );

  const routesProviderSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "RoutesProvider.ts",
    ),
  );

  const useContextSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "useContext.ts"),
  );

  // Components
  const routesSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "Routes.tsx"),
  );

  const routeLinkSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "RouteLink.tsx"),
  );

  const useRoutesSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "useRoutes.ts"),
  );

  return loadFilesContent.loadComponentCodesObjectByFileSchemas([
    createContextSchema,
    routesProviderSchema,
    useContextSchema,
    routesSchema,
    routeLinkSchema,
    useRoutesSchema,
  ]);
};

module.exports = importableAlemFileSchemas;
