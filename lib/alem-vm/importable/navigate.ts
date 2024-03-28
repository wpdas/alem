import { useContext } from "../alem-vm";

const navigate = (route: string) => {
  const routeContext = useContext<any>("alemRoutes");
  if (!routeContext) {
    console.error("navigate is being used without Router on top of it.");
  }

  console.log("navigate ----------> ", routeContext);

  if (routeContext.routes.includes(route)) {
    console.log("SIIUUU");
    // updateAlemRoutesState({ activeRoute: route });
    routeContext.updateRouteParameters({ ...routeContext, activeRoute: route });
  }
};

export default navigate;
