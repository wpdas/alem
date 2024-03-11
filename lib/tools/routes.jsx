// built in route store
createStore("alem:routes", {
  activeRoute: "",
  type: "URLBased",
  routes: [],
  parameterName: "path",
});
const useAlemLibRoutesStore = () => useStore("alem:routes");

const Routes = ({ routes, type, parameterName }) => {
  const {
    parameterName: paramName,
    activeRoute,
    update,
  } = useAlemLibRoutesStore();

  // NOTE: useEffect is breaking this component. it was removed
  // useEffect(() => {
  // Update the parameter name if needed
  // update({ parameterName: parameterName ? parameterName : "path" });
  // }, []);

  // Update the parameter name if needed
  update({ parameterName: parameterName ? parameterName : "path" });

  const routeParamName = paramName || "path";
  const routeType = type || "URLBased";

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

  // NOTE: useEffect is breaking this component. it was removed
  // BOS.props
  const bosProps = props;

  // ContentBased config only: should maintain the current route over refreshes?
  const maintainRoutesWhenDeveloping =
    isDevelopment && state.alemConfig_maintainRouteWhenDeveloping;

  if (routes) {
    // Check if currentUrlPath exists in the routes list, if not, use
    // the first element's path
    let currentUrlPath =
      bosProps[routeParamName] &&
      checkIfPathIsIncludedToRoutes(bosProps[routeParamName])
        ? bosProps[routeParamName]
        : routes[0].path;

    update({
      // list routes
      routes: routes.map((route) => route.path),
      type: routeType,
      // [routeParamName]= has priority
      ...(currentUrlPath && routeType === "URLBased" && state.alemRouteBlocked
        ? {
            activeRoute: currentUrlPath,
          }
        : {
            activeRoute:
              // maintainRoutesWhenDeveloping: If in development and ContentBased type,
              // maintain the route even when alemRouteSystemInitialized is not initialized?
              state.alemRouteSystemInitialized || maintainRoutesWhenDeveloping
                ? activeRoute
                : routes[0].path,
          }),
    });

    // set route ready and block route to give priority to "path="
    State.update({
      alemRouteSystemInitialized: true,
      alemRouteBlocked: true,
    });
  }

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

// go programatically to a new route
export const navigate = (routePath) => {
  const { routes, update } = useAlemLibRoutesStore();

  if (routes.includes(routePath)) {
    // Wait next tick to prevent invisible conflicts
    setTimeout(() => {
      // Umblock route to bypass "path=" parameter and change route
      State.update({ alemRouteBlocked: false });
      update({ activeRoute: routePath });
    }, 0);
  }
};

export const RouteLink = ({ to, children, className }) => {
  const { type, parameterName } = useAlemLibRoutesStore();

  if (type === "URLBased") {
    return (
      <a
        className={className}
        style={{ cursor: "pointer", textDecoration: "none" }}
        href={`?${parameterName}=${to}`}
      >
        {children}
      </a>
    );
  }

  const onClickHandler = () => {
    navigate(to);
  };

  return (
    <div
      style={{ cursor: "pointer", textDecoration: "none" }}
      onClick={onClickHandler}
    >
      {children}
    </div>
  );
};

export const createRoute = (path, component) => ({ path, component });
