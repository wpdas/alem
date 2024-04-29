/**
 * Files to be imported to the project.
 * Don't use them for compiler, they are not intended to be used there.
 */

/**
 * Todos os items listados aqui são inseridos automaticamente caso o nome do elemento seja requerido no import
 * de algum arquivo. Usar sempre o nome exato do recurso no const.
 */

const path = require("path");
const { ALEM_VM_FOLDER } = require("../constants");

// const importablePath = path.join(
//   __dirname,
//   "../",
//   ALEM_VM_FOLDER,
//   "importable",
// );

const importablePath = path.join(
  ".",
  "node_modules/alem/lib",
  ALEM_VM_FOLDER,
  "importable",
);

const RouterContext = path.join(importablePath, "RouterContext.ts");

const RouterProvider = path.join(importablePath, "RouterProvider.tsx");

const createContext = path.join(importablePath, "createContext.ts");

const useContext = path.join(importablePath, "useContext.ts");

const Router = path.join(importablePath, "Router.tsx");

const RouteLink = path.join(importablePath, "RouteLink.tsx");

const useRoutes = path.join(importablePath, "useRoutes.ts");

const getLocation = path.join(importablePath, "getLocation.ts");

const createDebounce = path.join(importablePath, "createDebounce.ts");

const navigate = path.join(importablePath, "navigate.ts");

const ModulesContext = path.join(importablePath, "ModulesContext.ts");

const ModulesProvider = path.join(importablePath, "ModulesProvider.tsx");

const useModule = path.join(importablePath, "useModule.ts");

// TODO: Trazer outros recursos que não alteram o estado global pra ca, exemplo: promisify, etc

module.exports = {
  importablePath,
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
