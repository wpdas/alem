import { useContext } from "../alem-vm";

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
 * Use Routes Context props
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
