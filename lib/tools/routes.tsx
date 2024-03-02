import { createStore, useStore } from "../../store";
import { useEffect, useState } from "../../bos";

// TODO: ver se existe uma forma de afetar a url (pode ser um down side deste projeto)
// TODO: para passar props para as paginas, basta usar o useStore/createStore

export type Route = {
  name: string;
  component: () => JSX.Element;
};

// built in route store
createStore("alem:routes", { activeRoute: "", routes: [] });
const useAlemLibRoutesStore = () => useStore("alem:routes");

type RoutesProps = {
  routes: Route[];
};
const Routes = ({ routes }: RoutesProps) => {
  const { activeRoute, update } = useAlemLibRoutesStore();
  const [Component, setComponent] = useState(routes[0].component);

  // Set default route
  useEffect(() => {
    if (activeRoute === "") {
      update({
        activeRoute: routes[0].name,
        routes: routes.map((route) => route.name),
      });
    } else {
      const currentComponent = routes.find(
        (route) => route.name === activeRoute,
      )?.component;
      if (currentComponent) {
        setComponent(currentComponent);
      }
    }
  }, [activeRoute]);

  if (!Component) return "";

  return Component;
};

export default Routes;

/**
 * Route - Navigate
 * @param routeName
 */
export const navigate = (routeName: string) => {
  const { routes, update } = useAlemLibRoutesStore();

  if (routes.includes(routeName)) {
    update({ activeRoute: routeName });
  }
};
