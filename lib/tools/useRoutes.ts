import { useContext } from "alem";

type UseRoutesProps = {
  alemRoutes: {
    routesInitialized: boolean;
    activeRoute: string;
    routeParameterName: string;
    routes: string[];
    routeType: string;
    routeBlocked: boolean;
  };
};

/**
 * Use Routes Context props. This can be useful if you'd like to perform some side effect whenever some context data changes.
 * @returns
 */
const useRoutes = () => {
  const contextData = useContext<UseRoutesProps>("alemRoutesProvider");
  if (!contextData) {
    console.error("useRoutes: You need to call `RoutesProvider()` first.");
  }
  return contextData!.alemRoutes;
};

export default useRoutes;
