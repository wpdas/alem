import { Route, RouteType, useEffect } from "../alem-vm";

type RouterProps = {
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
  /**
   * Initial route on which you want to start.
   */
  initialRoute?: string;
  alem?: any;
  alemRoutes?: any;
};

/**
 * Init routes
 * @param props
 * @returns
 */
const Router = (props: RouterProps) => {
  const { routes, type, parameterName, alem, alemRoutes, initialRoute } = props;

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
      // Comes from RouterProvider
      alemRoutes.updateRouteParameterName(parameterName);
    }
  }, []);

  const { routeParameterName, routeType, activeRoute } = alemRoutes;
  const routeParamName = parameterName || routeParameterName;

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
        bosProps[routeParamName] &&
        checkIfPathIsIncludedToRoutes(bosProps[routeParamName])
          ? bosProps[routeParamName]
          : routes[0].path;

      // Updates
      // List of routes and route type
      const _routes = routes.map((route: Route) => route.path);
      const _type = type || "URLBased";
      let _activeRoute = initialRoute || currentUrlPath;

      if (
        !(currentUrlPath && routeType == "URLBased" && alemRoutes.routeBlocked)
      ) {
        _activeRoute = maintainRoutesWhenDeveloping
          ? initialRoute || activeRoute
          : routes[0].path;
      }

      // Se nenhuma rota está ativa, define o primeiro item das rotas como o ativo
      if (!_activeRoute) {
        _activeRoute = routes[0].path;
      }

      // Comes from RouterProvider
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

export default Router;
