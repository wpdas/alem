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

const RoutesProvider = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "RoutesProvider.ts",
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

const Routes = path.join(
  __dirname,
  "../",
  ALEM_VM_FOLDER,
  "importable",
  "Routes.tsx",
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

// TODO: Trazer outros recursos que não alteram o estado global pra ca, exemplo: promisify, etc

module.exports = {
  RoutesProvider,
  createContext,
  useContext,
  Routes,
  RouteLink,
  useRoutes,
};
