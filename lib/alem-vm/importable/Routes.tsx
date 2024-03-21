import { Route, RouteType, useEffect } from "../alem-vm";

type RoutesProps = {
  routes: Route[];
  /**
   * Defines how the routes will behave. Default is `URLBased`.
   *
   * `URLBased`: Update the URL and reload/load page;
   * `ContentBased`: Doesn't update the URL and doesn't reload page.
   *
   * Consider using `URLBased` if your project's URL paths are important to its functionality. E.g.: sharing a link for a specific page.
   */
  type?: RouteType;
  /**
   * Parameter name to store current route name. Default is "path".
   */
  parameterName?: string;
  alem?: any;
  alemRoutes?: any;
};

/**
 * Init routes
 * @param props
 * @returns
 */
const Routes = (props: RoutesProps) => {
  const { routes, type, parameterName, alem, alemRoutes } = props;

  // Checa se sao rotas validas
  useEffect(() => {
    routes.forEach((route) => {
      if (!route.component) {
        console.error(`Routes: Invalid component for route "${route.path}"`);
      }
    });
  }, [routes]);

  // Update the parameter name if needed
  useEffect(() => {
    if (parameterName && parameterName !== alem.routeParameterName) {
      // Comes from RoutesProvider
      alemRoutes.updateRouteParameterName(parameterName);
    }
  }, []);

  const { routeParameterName, routeType, activeRoute } = alemRoutes;

  const checkIfPathIsIncludedToRoutes = (routePath: string) => {
    let pathFound = false;
    if (routes) {
      routes.forEach((routeItem: Route) => {
        if (pathFound) return;

        if (!pathFound) {
          pathFound = routeItem.path === routePath;
        }
      });
    }
    return pathFound;
  };

  useEffect(() => {
    // BOS.props
    const bosProps = alem.rootProps;

    // ContentBased config only: should maintain the current route over refreshes?
    const maintainRoutesWhenDeveloping =
      alem.isDevelopment && alem.alemConfig_maintainRouteWhenDeveloping;

    if (routes) {
      // Check if currentUrlPath exists in the routes list, if not, use
      // the first element's path
      let currentUrlPath =
        bosProps[routeParameterName] &&
        checkIfPathIsIncludedToRoutes(bosProps[routeParameterName])
          ? bosProps[routeParameterName]
          : routes[0].path;

      // Updates
      // List of routes and route type
      const _routes = routes.map((route: Route) => route.path);
      // console.log("ROUTES================>:", _routes, alemRoutes);
      const _type = type || "URLBased";
      let _activeRoute = currentUrlPath;

      if (!(currentUrlPath && routeType == "URLBased" && alem.routeBlocked)) {
        _activeRoute = maintainRoutesWhenDeveloping
          ? activeRoute
          : routes[0].path;
      }

      // Comes from RoutesProvider
      alemRoutes.updateRouteParameters({
        routes: _routes,
        routeType: _type,
        activeRoute: _activeRoute,
        routeBlocked: true,
      });
    }
  }, [routeType]);

  // Default route
  if (activeRoute === "") {
    const Component = routes[0].component;
    return <Component />;
  }

  // Route by route path
  const Component = routes.find(
    (route: Route) => route.path === activeRoute,
  )?.component;
  if (Component) {
    return <Component />;
  }

  // Empty
  return <></>;
};

export default Routes;
