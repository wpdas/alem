import { useRoutes } from "../alem-vm";

/**
 * This returns the current location object.
 *
 * Works with Router only.
 */
const getLocation = () => {
  const routes = useRoutes();
  return {
    pathname: routes.activeRoute,
    routes: routes.routes,
    isRoutesReady: routes.routes && routes.routes.length > 0,
  };
};

export default getLocation;
