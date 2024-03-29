import { Route, props } from "../alem-vm";

type URLRouterProps = {
  routes: Route[];
  /**
   * Parameter name to store current route name. Default is "path".
   */
  parameterName?: string;
};

/**
 * Init routes using simple Router system where it will render content
 * based on the router path.
 * @param props
 * @returns
 */
const SimpleRouter = ({ routes, parameterName }: URLRouterProps) => {
  // Checa se sao rotas validas
  routes.forEach((route) => {
    if (!route.component) {
      console.error(`Routes: Invalid component for route "${route.path}"`);
    }

    if (!route.path) {
      console.error("Routes: Invalid path:", route.path);
    }
  });

  // BOS.props
  const bosProps: Record<string, any> = props.alem.rootProps || {};
  const activeRoute = bosProps[parameterName || "path"] || routes[0].path;

  const Component = routes.find((route: Route) => route.path === activeRoute)
    ?.component ||
    routes[0].component || <></>;

  return <Component />;
};

export default SimpleRouter;
