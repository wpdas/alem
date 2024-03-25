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

const RouterProvider = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "RouterProvider.ts",
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

const SimpleRouter = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "SimpleRouter.tsx",
);

const createDebounce = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "createDebounce.ts",
);

// TODO: Trazer outros recursos que não alteram o estado global pra ca, exemplo: promisify, etc

module.exports = {
  RouterProvider,
  createContext,
  useContext,
  Router,
  RouteLink,
  useRoutes,
  getLocation,
  SimpleRouter,
  createDebounce,
};
