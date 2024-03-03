// built in route store
createStore("alem:routes", { activeRoute: "", routes: [] });
const useAlemLibRoutesStore = () => useStore("alem:routes");

const Routes = ({ routes }) => {
  const { activeRoute, update } = useAlemLibRoutesStore();

  useEffect(() => {
    // BOS.props
    const bosProps = props;

    if (routes) {
      update({
        // list routes
        routes: routes.map((route) => route.path),
        // path= has priority
        ...(bosProps.path ? { activeRoute: bosProps.path } : {}),
      });
    }
  }, []);

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
    update({ activeRoute: routePath });
  }
};

// Update the URL. (Slower but better for SEO)
export const RouteLink = ({ to, children }) => {
  return (
    <a
      style={{ cursor: "pointer", textDecoration: "none" }}
      href={`?path=${to}`}
    >
      {children}
    </a>
  );
};

// Doesn't update the URL. (Faster but bad for SEO)
export const ContentRouteLink = ({ to, children }) => {
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

// TypeScript model
// import { createStore, useStore } from "../../";
// import { props, useEffect } from "../../bos";

// export type Route = {
//   path: string;
//   component: () => JSX.Element;
// };

// // built in route store
// createStore("alem:routes", { activeRoute: "", routes: [] });
// const useAlemLibRoutesStore = () => useStore("alem:routes");

// type RoutesProps = {
//   routes: Route[];
// };

// const Routes = ({ routes }: RoutesProps) => {
//   const { activeRoute, update } = useAlemLibRoutesStore();

//   useEffect(() => {
//     // BOS.props
//     const bosProps = props;

//     if (routes) {
//       update({
//         // list routes
//         routes: routes.map((route) => route.path),
//         // path= has priority
//         ...(bosProps.path ? { activeRoute: bosProps.path } : {}),
//       });
//     }
//   }, []);

//   // Default route
//   if (activeRoute === "") {
//     const Component = routes[0].component;
//     return <Component />;
//   }

//   // Route by route path
//   const Component = routes.find(
//     (route) => route.path === activeRoute,
//   )?.component;
//   if (Component) {
//     return <Component />;
//   }

//   // Empty
//   return "";
// };

// export default Routes;

// // go programatically to a new route
// // NOTE: removed for now to avoid confusion
// // export const navigate = (routePath: string) => {
// //   const { routes, update } = useAlemLibRoutesStore();

// //   if (routes.includes(routePath)) {
// //     update({ activeRoute: routePath });
// //   }
// // };

// // Link
// type RouteLinkProps = {
//   to: string;
//   children: JSX.Element;
// };
// export const RouteLink = ({ to, children }: RouteLinkProps) => {
//   return (
//     <a
//       style={{ cursor: "pointer", textDecoration: "none" }}
//       href={`?path=${to}`}
//     >
//       {children}
//     </a>
//   );
// };

// const createRoute = (path: string, component: () => JSX.Element) => ({path, component})
