// built in route store
createStore("alem:routes", {
  activeRoute: "",
  type: "URLBased",
  routes: [],
});
const useAlemLibRoutesStore = () => useStore("alem:routes");

const Routes = ({ routes, type }) => {
  const { activeRoute, update } = useAlemLibRoutesStore();
  const routeType = type || "URLBased";

  useEffect(() => {
    // BOS.props
    const bosProps = props;

    // ContentBased config only: should maintain the current route over refreshes?
    const maintainRoutesWhenDeveloping =
      isDevelopment && state.alemConfig_maintainRouteWhenDeveloping;

    if (routes) {
      update({
        // list routes
        routes: routes.map((route) => route.path),
        type: routeType,
        // path= has priority
        ...(bosProps.path && routeType === "URLBased" && state.alemRouteBlocked
          ? { activeRoute: bosProps.path }
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
  }, [props.path, activeRoute]);

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
    // Umblock route to bypass "path=" parameter and change route
    State.update({ alemRouteBlocked: false });
    update({ activeRoute: routePath });
  }
};

export const RouteLink = ({ to, children, className }) => {
  const { type } = useAlemLibRoutesStore();

  if (type === "URLBased") {
    return (
      <a
        className={className}
        style={{ cursor: "pointer", textDecoration: "none" }}
        href={`?path=${to}`}
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
