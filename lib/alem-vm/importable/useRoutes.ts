import { UseRoutes, UseRoutesProps, useContext } from "../alem-vm";

/**
 * Use Routes Context props. This can be useful if you'd like to perform some side effect whenever some context data changes.
 *
 * Works with Router only.
 *
 * @returns
 */
const useRoutes = () => {
  const contextData = useContext<UseRoutesProps>("alemRoutes");
  if (!contextData) {
    console.error("useRoutes: You need to call `RouterProvider()` first.");
  }

  const data: UseRoutes = {
    routesInitialized: contextData.routesInitialized,
    activeRoute: contextData.activeRoute,
    routeParameterName: contextData.routeParameterName,
    routes: contextData.routes,
    routeType: contextData.routeType,
    routeParams: contextData.routeParams,
    history: contextData.history,
  };

  return data!;
};

export default useRoutes;
