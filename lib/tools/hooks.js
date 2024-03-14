// TODO: Testar se está reagindo, caso não esteja, criar um Observable entre esse hook e o Routes
const useParams = () => {
  const parameterName = _alemRouteParameterName;
  // Remove "path" (being used internally)
  const currentProps = _alemProps;
  if (Object.keys(currentProps).includes(parameterName)) {
    delete currentProps[parameterName];
  }
  return currentProps;
};

// TODO: Testar se está reagindo, caso não esteja, criar um Observable entre esse hook e o Routes
const useLocation = () => {
  const activeRoute = _activeRoute;
  const routes = _alemRoutes;
  return {
    pathname: activeRoute,
    routes,
    isRoutesReady: routes && routes.length > 0,
  };
};

const createRoute = (path, component) => ({ path, component });
