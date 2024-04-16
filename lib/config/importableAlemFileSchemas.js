const path = require("path");
const transformFileToFileSchema = require("../actions/transformFileToFileSchema");
const loadFilesContent = require("../actions/loadFilesContent");
const { ALEM_VM_FOLDER } = require("../constants");

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

  const routerContextSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "RouterContext.ts",
    ),
  );

  const routerProviderSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "RouterProvider.tsx",
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

  const modulesContextSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "ModulesContext.ts",
    ),
  );

  const modulesProviderSchema = transformFileToFileSchema(
    path.join(
      __dirname,
      "../",
      ALEM_VM_FOLDER,
      "importable",
      "ModulesProvider.tsx",
    ),
  );

  const useModuleSchema = transformFileToFileSchema(
    path.join(__dirname, "../", ALEM_VM_FOLDER, "importable", "useModule.ts"),
  );

  return loadFilesContent.loadComponentCodesObjectByFileSchemas([
    createContextSchema,
    routerContextSchema,
    routerProviderSchema,
    useContextSchema,
    routerSchema,
    routeLinkSchema,
    useRoutesSchema,
    getLocationSchema,
    createDebounceSchema,
    navigateSchema,
    modulesContextSchema,
    modulesProviderSchema,
    useModuleSchema,
  ]);
};

module.exports = importableAlemFileSchemas;
