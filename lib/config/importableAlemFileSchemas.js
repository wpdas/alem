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

  const routerProviderSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "RouterProvider.ts",
    ),
  );

  const useContextSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "useContext.ts"),
  );

  const routerSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "Router.tsx"),
  );

  const routeLinkSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "RouteLink.tsx"),
  );

  const useRoutesSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "useRoutes.ts"),
  );

  const getLocationSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "getLocation.ts"),
  );

  const simpleRouterSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "SimpleRouter.tsx",
    ),
  );

  const createDebounceSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "createDebounce.ts",
    ),
  );

  const navigateSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "navigate.ts"),
  );

  return loadFilesContent.loadComponentCodesObjectByFileSchemas([
    createContextSchema,
    routerProviderSchema,
    useContextSchema,
    routerSchema,
    routeLinkSchema,
    useRoutesSchema,
    getLocationSchema,
    simpleRouterSchema,
    createDebounceSchema,
    navigateSchema,
  ]);
};

module.exports = importableAlemFileSchemas;
