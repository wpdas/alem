import { useContext } from "../alem-vm";

type UseRoutesProps = {
  routesInitialized: boolean;
  activeRoute: string;
  routeParameterName: string;
  routes: string[];
  routeType: string;
  routeBlocked: boolean;
};

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
  return contextData!;
};

export default useRoutes;
