/**
 * Esse componente deve ser transformado em Widget
 */
import {
  useEffect,
  useState,
  _alemNavigateFactory, // Deve ter no import para ser reconhecido pelo compilador de Widgets
  _alemProps,
  _alemRoutes,
  _alemRouteType,
  _alemRouteBlocked,
  _activeRoute,
} from "./tools";

/**
 * Route register
 */
export type Route = {
  path: string;
  component: () => JSX.Element;
};

/**
 * Defines how the routes will behave
 *
 * `URLBased`: Update the URL and reload/load page
 * `ContentBased`: Doesn't update the URL and doesn't reload page
 *
 * E.g.:
 * ```
 * const HomeRoute = createRoute("home", HomePage);
 * const ProfileRoute = createRoute("profile", ProfilePage);
 * return <Routes routes={[HomeRoute, ProfileRoute]} type="URLBased" />;
 * ```
 */
export type RouteType = "URLBased" | "ContentBased";

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
  // navigateFactory?: (navigate: (route: string) => void) => void;
};

const Routes = ({ routes, type, parameterName }: RoutesProps) => {
  const [activeRoute, setActiveRoute] = useState(routes[0].path);

  // Atualiza o _activeRoute
  useEffect(() => {
    //TODO: Verifica se o `useLocation` vai reagir à mudança, se nao reagir,
    // TODO: deve ser implementado um Observable.
    _activeRoute = activeRoute;
  }, [activeRoute]);

  const routeParamName = parameterName
    ? parameterName
    : _alemRouteParameterName;
  const routeType = type || "URLBased";

  const [seq, setSeq] = useState(0);

  useEffect(() => {
    // console.log("EFFECT");
    if (seq < routes.length) {
      setActiveRoute(routes[seq].path);
    } else {
      setSeq(0);
      setActiveRoute(routes[0].path);
    }
  }, [seq]);

  useEffect(() => {
    // Set navigate method (used globally)
    _alemNavigateFactory((route: string) => {
      setActiveRoute(route);
    });
  }, []);

  const checkIfPathIsIncludedToRoutes = (routePath: string) => {
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

  // Prepare routes
  // useEffect(() => {
  //   // BOS.props
  //   const bosProps = _alemProps;

  //   if (routes) {
  //     // Check if currentUrlPath exists in the routes list, if not, use
  //     // the first element's path
  //     let currentUrlPath =
  //       bosProps[routeParamName] &&
  //       checkIfPathIsIncludedToRoutes(bosProps[routeParamName])
  //         ? bosProps[routeParamName]
  //         : routes[0].path;

  //     // list routes (ERA do state)
  //     _alemRoutes = routes.map((route) => route.path);
  //     _alemRouteType = routeType;
  //     // [routeParamName]= has priority

  //     // TODO: talvez o "maintainRoutesWhenDeveloping" não seja mais necessário

  //     if (currentUrlPath && routeType === "URLBased" && _alemRouteBlocked) {
  //       setActiveRoute(currentUrlPath);
  //     }

  //     // set route ready and block route to give priority to "path="
  //     _alemRouteBlocked = true;
  //   }
  // }, [routes, routeType]);

  // console.log(activeRoute, state);

  // const {
  //   // parameterName: paramName,
  //   activeRoute,
  //   update,
  // } = useStore<any>("alem:routes");
  // let Component;

  const Component =
    routes.find((route) => route.path === activeRoute)?.component ||
    routes[0].component;
  // console.log("ACHOU:", Component);
  // if (Component) {
  //   return <Component />;
  // }

  // if (activeRoute === "a") {
  //   Component = routes[0].component;
  //   // return <Component />
  // }

  // if (activeRoute === "b") {
  //   Component = routes[2].component;
  //   // return <Component />
  // }

  console.log("COMPO", activeRoute);

  if (Component) {
    return (
      <>
        olha: {seq}
        <button
          onClick={() => {
            setSeq(seq + 1);

            // setActiveRoute(routes[seq].path);
            // setActiveRoute(routes[Math.round(routes.length * Math.random())].path);
            // update({ activeRoute: "installation" });
          }}
        >
          Change
        </button>
        {Component && <Component />}
      </>
    );
  }

  // Empty
  return "";
};

export default Routes;
