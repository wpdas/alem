import { RouteType, createContext, useContext } from "../alem-vm";

const ALEM_ROUTES_CONTEXT_KEY = "alemRoutes";

const RouterProvider = () => {
  const { setDefaultData, updateData } = createContext(ALEM_ROUTES_CONTEXT_KEY);

  /**
   * Update the alem state
   * @param updatedState
   */
  const updateAlemRoutesState = (updatedState: Record<string, any>) => {
    updateData({
      ...updatedState,
    });
  };

  /**
   * Get alem state
   * @returns
   */
  const alemRoutesState = () =>
    useContext<any>(ALEM_ROUTES_CONTEXT_KEY).alemRoutes;

  setDefaultData({
    // ==================================== Routes ====================================
    routesInitialized: false,
    activeRoute: "",
    routeParameterName: "path",
    routes: [] as string[],
    routeType: "URLBased", // URLBased | ContentBased
    routeBlocked: true, // Used to force navigate to other paths even when the "path=" parameter is present into the URL

    // ==================================== Routes - Methods ====================================

    /**
     * Update Route Parameter Name
     * @param parameterName
     */
    updateRouteParameterName: (parameterName: string) => {
      updateAlemRoutesState({
        routeParameterName: parameterName,
      });
    },

    /**
     * Update route parameters
     */
    updateRouteParameters: (props: {
      routes?: string[];
      routeType?: RouteType;
      activeRoute?: string;
      routeBlocked?: boolean;
    }) => {
      updateAlemRoutesState({
        routes: props.routes || alemRoutesState().routes,
        routeType: props.routeType || alemRoutesState().routeType,
        activeRoute: props.activeRoute || alemRoutesState().activeRoute,
        routeBlocked: props.routeBlocked || alemRoutesState().routeBlocked,
        routesInitialized: true,
      });
    },

    /**
     * Update route type
     * @param route
     */
    // updateRouteType: (type: RouteType) => {
    //   updateAlemRoutesState({
    //     routeType: type,
    //   })
    // },

    /**
     * Programmatically navigate to available routes. The URL will not be affected!
     */
    navigate: (route: string) => {
      // console.log("RoutesProvider -> navigate to:", route, alemRoutesState());
      if (alemRoutesState().routes.includes(route)) {
        updateAlemRoutesState({ activeRoute: route });
      }
    },

    /**
     * This hook returns the current location object.
     * @returns
     */
    getLocation: () => {
      return {
        pathname: alemRoutesState().activeRoute,
        routes: alemRoutesState().routes,
        isRoutesReady:
          alemRoutesState().routes && alemRoutesState().routes.length > 0,
      };
    },
  });
};

export default RouterProvider;
