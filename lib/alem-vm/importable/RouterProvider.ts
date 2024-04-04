import {
  RouteType,
  Storage,
  createContext,
  props,
  useContext,
} from "../alem-vm";

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
  const alemRoutesState = () => useContext<any>(ALEM_ROUTES_CONTEXT_KEY);

  setDefaultData({
    // ==================================== Routes ====================================
    routesInitialized: false,
    activeRoute: "",
    routeParams: {},
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
    updateRouteParameters: (routeProps: {
      routes?: string[];
      routeType?: RouteType;
      activeRoute?: string;
      routeBlocked?: boolean;
      routeParams?: Record<string, any>;
    }) => {
      updateAlemRoutesState({
        routes: routeProps.routes || alemRoutesState().routes,
        routeType: routeProps.routeType || alemRoutesState().routeType,
        activeRoute: routeProps.activeRoute || alemRoutesState().activeRoute,
        routeBlocked: routeProps.routeBlocked || alemRoutesState().routeBlocked,
        routeParams: routeProps.routeParams || alemRoutesState().routeParams,
        routesInitialized: true,
      });

      // If config.keepRoute is activated, store the current route to be used later
      if (props.alem.keepRoute && routeProps.activeRoute) {
        Storage.privateSet("alem::keep-route", routeProps.activeRoute);
      }
    },
  });
};

export default RouterProvider;
