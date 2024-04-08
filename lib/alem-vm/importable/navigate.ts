import { useContext } from "../alem-vm";

const navigate = {
  /**
   * Go to new route
   * @param route
   * @param params
   */
  to: (route: string, params: Record<string, any>) => {
    const routeContext = useContext<any>("alemRoutes");
    if (!routeContext) {
      console.error("navigate is being used without Router on top of it.");
    }

    if (routeContext.routes.includes(route)) {
      // Precia enviar toda a estrura ja existente e atualizar somente o recurso desejado.
      // Isso se deve devido a quando se altera um state, o componente onde ele está é
      // renderizado novamente. Ou seja, o Router também vai ser renderizado novamente
      // e as propriedades precisam se manter, caso contrário, voltam para o estado inicial.
      routeContext.updateRouteParameters({
        ...routeContext,
        activeRoute: route,
        routeParams: params || {},
      });
    }
  },

  /**
   * Go back to the previous route
   */
  back: () => {
    const routeContext = useContext<any>("alemRoutes");
    if (!routeContext) {
      console.error("navigate is being used without Router on top of it.");
    }

    const updatedHistory = routeContext.history;
    if (updatedHistory) {
      updatedHistory.pop();
      const routeProps = updatedHistory.at(-1);
      if (routeProps.route) {
        routeContext.updateRouteParameters({
          ...routeContext,
          history: updatedHistory,
          activeRoute: routeProps.route,
          routeParams: routeProps.routeParams,
        });
      }
    }
  },
};

export default navigate;
