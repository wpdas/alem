import { Route, RouteType, useEffect } from "../alem-vm";
import { Alem } from "../state";

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
  alem: Alem;
};

const Routes = (props: RoutesProps) => {
  const { routes, type, parameterName, alem } = props;

  // Update the parameter name if needed
  useEffect(() => {
    if (parameterName && parameterName !== alem.routeParameterName) {
      alem.updateRouteParameterName(parameterName);
    }
  }, []);

  const { routeParameterName, routeType, activeRoute } = alem;

  const checkIfPathIsIncludedToRoutes = (routePath) => {
    let pathFound = false;
    if (routes) {
      routes.forEach((routeItem) => {
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
    const bosProps = props;

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
      const _routes = routes.map((route) => route.path);
      const _type = type || "URLBased";
      let _activeRoute = currentUrlPath;

      if (!(currentUrlPath && routeType == "URLBased" && alem.routeBlocked)) {
        _activeRoute = maintainRoutesWhenDeveloping
          ? activeRoute
          : routes[0].path;
      }

      alem.updateRouteParameters({
        routes: _routes,
        routeType: _type,
        activeRoute: _activeRoute,
        routeBlocked: true,
      });
    }
  }, [routeParameterName, routeType, activeRoute]);

  // Default route
  if (activeRoute === "") {
    const Component = routes[0].component;
    return <Component />;
  }

  // Route by route path
  const Component = routes.find(
    (route) => route.path === activeRoute,
  )?.component;
  if (Component) {
    return <Component />;
  }

  // Empty
  return "";
};

export default Routes;
