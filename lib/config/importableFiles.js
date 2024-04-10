/**
 * Files to be imported to the project.
 * Don't use them for compiler, they are not intended to be used there.
 */

/**
 * Todos os items listados aqui são inseridos automaticamente caso o nome do elemento seja requerido no import
 * de algum arquivo. Usar sempre o nome exato do recurso no const.
 */

const path = require("path");
const { ALEM_VM_FOLDER } = require("../contants");

const RouterContext = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "RouterContext.ts",
);

const RouterProvider = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "RouterProvider.tsx",
);

const createContext = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "createContext.ts",
);
const useContext = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "useContext.ts",
);

const Router = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "Router.tsx",
);

const RouteLink = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "RouteLink.tsx",
);

const useRoutes = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "useRoutes.ts",
);

const getLocation = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "getLocation.ts",
);

const createDebounce = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "createDebounce.ts",
);

const navigate = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "navigate.ts",
);

const ModulesContext = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "ModulesContext.ts",
);

const ModulesProvider = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "ModulesProvider.tsx",
);

const useModule = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "useModule.ts",
);

// TODO: Trazer outros recursos que não alteram o estado global pra ca, exemplo: promisify, etc

module.exports = {
  RouterContext,
  RouterProvider,
  createContext,
  useContext,
  Router,
  RouteLink,
  useRoutes,
  getLocation,
  createDebounce,
  navigate,
  ModulesContext,
  ModulesProvider,
  useModule,
};
