import {
  History,
  RouteType,
  Storage,
  createContext,
  props,
  useContext,
} from "../alem-vm";

const ALEM_ROUTES_CONTEXT_KEY = "alemRoutes";

const RouterContext = () => {
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
    history: [], // historico de navegacao [array de nome de telas visitadas]
    routeParameterName: "path",
    routes: [] as string[],
    routeType: "URLBased", // URLBased | ContentBased
    routeBlocked: true, // Used to force navigate to other paths even when the "path=" parameter is present into the URL

    // ==================================== Routes - Methods ====================================

    /**
     * Update route parameters
     */
    updateRouteParameters: (routeProps: {
      routes?: string[];
      routeType?: RouteType;
      activeRoute?: string;
      routeBlocked?: boolean;
      routeParams?: Record<string, any>;
      history?: History[]; // Previous history if config.keepRoute is true
      routeParameterName?: string;
    }) => {
      // Update History
      const currentHistory = alemRoutesState().history;
      const hasPreviousHistory =
        currentHistory.length === 0 && routeProps.history;
      const updatedHistory = hasPreviousHistory
        ? routeProps.history
        : alemRoutesState().history;

      if (routeProps.activeRoute) {
        const newHistory: History = {
          route: routeProps.activeRoute,
          routeParams: routeProps.routeParams,
        };

        // If history has more than 10 items, shift
        if (updatedHistory.length > 10) {
          updatedHistory.shift();
        }

        // Register history only if the route is different
        if (updatedHistory.at(-1).route !== routeProps.activeRoute) {
          updatedHistory.push(newHistory);
        }
      }

      updateAlemRoutesState({
        routes: routeProps.routes || alemRoutesState().routes,
        routeType: routeProps.routeType || alemRoutesState().routeType,
        activeRoute: routeProps.activeRoute || alemRoutesState().activeRoute,
        routeBlocked: routeProps.routeBlocked || alemRoutesState().routeBlocked,
        routeParams: routeProps.routeParams || alemRoutesState().routeParams,
        routeParameterName:
          routeProps.routeParameterName || alemRoutesState().routeParameterName,
        history: updatedHistory,
        routesInitialized: true,
      });

      // If config.keepRoute is activated, store the current route to be used later
      if (props.alem.keepRoute && routeProps.activeRoute) {
        Storage.privateSet("alem::keep-route", updatedHistory);
      }
    },
  });
};

export default RouterContext;
