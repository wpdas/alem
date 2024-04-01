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
  const alemRoutesState = () => useContext<any>(ALEM_ROUTES_CONTEXT_KEY);

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
    updateRouteParameters: (routeProps: {
      routes?: string[];
      routeType?: RouteType;
      activeRoute?: string;
      routeBlocked?: boolean;
    }) => {
      updateAlemRoutesState({
        routes: routeProps.routes || alemRoutesState().routes,
        routeType: routeProps.routeType || alemRoutesState().routeType,
        activeRoute: routeProps.activeRoute || alemRoutesState().activeRoute,
        routeBlocked: routeProps.routeBlocked || alemRoutesState().routeBlocked,
        routesInitialized: true,
      });
    },
  });
};

export default RouterProvider;
