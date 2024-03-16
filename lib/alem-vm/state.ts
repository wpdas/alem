/**
 * Todos os items do state inicial
 */

import { Route, RouteType, State, asyncFetch, state } from "./alem-vm";

/**
 * Update the alem state
 * @param updatedState
 */
const updateAlemState = (updatedState: Record<string, any>) => {
  State.update({
    alem: {
      ...state.alem,
      ...updatedState,
    },
  });
};

/**
 * Get alem state
 * @returns
 */
const alemState = () => state.alem as typeof AlemStateInitialBody.alem;

const AlemStateInitialBody = {
  alem: {
    // ==================================== Configs ====================================
    /**
     * During development, if the route is of type ContentBased, it will return to the
     * first registered route every time a file is changed. This property enables or
     * disables this behavior.
     */
    alemConfig_maintainRouteWhenDeveloping: ":::MAINTAIN_ROUTE:::", // boolean
    alemEnvironment: ":::ENV:::", // production | development

    // ==================================== State Management ====================================
    // TODO: Se usar o recurso persistencia (criar um config pra isso), deve iniciar "falso" e ser true na logica de carregar dados do localstorage
    alemStoreReady: true,
    alemStateManagement: {},
    stores: [] as string[],

    // ==================================== Routes ====================================
    activeRoute: "",
    routeParameterName: "path",
    routes: [],
    routeType: "URLBased", // URLBased | ContentBased
    routeBlocked: true, // Used to force navigate to other paths even when the "path=" parameter is present into the URL

    // ==================================== APIs ====================================
    alemExternalStylesLoaded: false,
    alemExternalStylesBody: "",
  },
  // ======= FIM ALEM =======

  /**:::STATE.INIT:::*/
};

State.init(AlemStateInitialBody);

// Props para ser compartilhada com todos os Widgets
export const props = {
  ...props,

  // Alem
  alem: {
    // ==================================== State Management ====================================

    // ...state.alem,

    /**
     * createStore - State Management
     */
    createStore: (storeKey: string, obj) => {
      // store was not initialized yet & obj is available...
      if (
        !alemState().stores.includes(storeKey) &&
        obj &&
        alemState().alemStoreReady
      ) {
        const initParsedObj = {};
        Object.keys(obj).forEach(
          (key) =>
            (initParsedObj[`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}${key}`] =
              obj[key]),
        );

        const updatedStores = alemState().stores
          ? [...alemState().stores, storeKey]
          : [storeKey];

        updateAlemState({
          alemStateManagement: {
            ...alemState().alemStateManagement,
            ...initParsedObj,
          },
          stores: updatedStores,
        });
        // Storage.privateSet("alem:store", updatedState);
      }
    },

    /**
     * useStore - State Management
     */
    useStore: (storeKey) => {
      // return its "values" and "update" method
      const getParsedObj = {};
      Object.keys(alemState().alemStateManagement).forEach((key) => {
        if (key.includes(`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}`)) {
          getParsedObj[
            key.replace(`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}`, "")
          ] = alemState().alemStateManagement[key];
        }
      });
      return {
        // values
        ...getParsedObj,
        // update method
        update: (updateObj) => {
          if (alemState().alemStoreReady) {
            const updateParsedObj = {};
            Object.keys(updateObj).forEach(
              (key) =>
                (updateParsedObj[
                  `${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}${key}`
                ] = updateObj[key]),
            );

            updateAlemState({
              alemStateManagement: {
                ...alemState().alemStateManagement,
                ...updateParsedObj,
              },
            });

            // Storage.privateSet(
            //   "alem:store",
            //   removeAlemPropsFromState(updatedState),
            // );
          }
        },
      };
    },

    /**
     * clearStore - State Management
     */
    clearStore: () => {
      updateAlemState({ alemStateManagement: {} });
      // Storage.privateSet("alem:store", {});
    },

    // ==================================== Routes ====================================

    /**
     * Update Route Parameter Name
     * @param parameterName
     */
    updateRouteParameterName: (parameterName: string) => {
      updateAlemState({
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
      updateAlemState({
        routes: props.routes || alemState().routes,
        routeType: props.routeType || alemState().routeType,
        activeRoute: props.activeRoute || alemState().activeRoute,
        routeBlocked: props.routeBlocked || alemState().routeBlocked,
      });
    },

    /**
     * Create Routes
     * @param path
     * @param component
     * @returns
     */
    createRoute: (path, component) => ({ path, component }) as Route,

    /**
     * Programmatically navigate to available routes. The URL will not be affected!
     */
    navigate: (route) => {
      if (alemState().routes.includes[route]) {
        updateAlemState({ activeRoute: route });
      }
    },

    /**
     * This hook returns the current location object.
     * It can be useful if you'd like to perform some side effect whenever the current location changes.
     * @returns
     */
    useLocation: () => {
      return {
        pathname: alemState().activeRoute,
        routes: alemState().routes,
        isRoutesReady: alemState().routes && alemState().routes.length > 0,
      };
    },

    /**
     * All parameters provided by the URL.
     * @returns
     */
    useParams: (removeRoutePathParam: false) => {
      // Remove "path" (being used internally)
      let params = props;
      if (removeRoutePathParam) {
        if (Object.keys(params).includes(alemState().routeParameterName)) {
          delete params[alemState().routeParameterName];
        }
      }
      return params;
    },

    // ==================================== APIs ====================================

    /**
     * loadExternalStyles: load external fonts and css styles
     * @param {string[]} URLs
     */
    loadExternalStyles: (URLs) => {
      if (!URLs && !alemState().alemExternalStylesLoaded) {
        return;
      }

      let stylesBody = "";
      const totalItems = URLs.length;
      let loadedCounter = 0;

      const loadStyle = (styleURL) => {
        asyncFetch(styleURL).then((response) => {
          stylesBody += response.body;
          loadedCounter += 1;

          if (loadedCounter === totalItems) {
            updateAlemState({
              alemExternalStylesLoaded: true,
              alemExternalStylesBody: stylesBody,
            });
          }
        });
      };

      URLs.forEach((styleURL) => {
        loadStyle(styleURL);
      });

      return alemState().alemExternalStylesLoaded;
    },

    /**
     * Call resolve or reject for a given caller
     * E.g:
     * const timeout = 5000 // 5sec
     * const getStorage = () => Storage.get('my-key');
     * promisify(getStorage, (storageData) => console.log(storageData), () => console.log('Error'), timeout)
     *
     * Default timeout is 10 seconds
     */
    promisify: <D>(
      caller: () => D,
      resolve: (result: D) => void,
      reject: () => void,
      _timeout?: number,
    ) => {
      const timer = 100;
      const timeout = _timeout || 10000;
      let timeoutCheck = 0;

      const find = () => {
        const response = caller();
        if (response !== undefined && response !== null) {
          resolve(response);
        } else {
          if (timeoutCheck < timeout) {
            // try again
            setTimeout(find, timer);
            timeoutCheck += timer;
          } else {
            if (reject) {
              reject();
            }
          }
        }
      };

      // Fist attempt
      find();
    },

    /**
     * Is Development?
     */
    isDevelopment: alemState().alemEnvironment === "development",

    // ==================================== Components|Widgets Code ====================================
    componentsCode: {
      /**:::ALEM_COMPONENTS_CODE:::*/
      /**:::COMPONENTS_CODE:::*/
    },
  },
};

export type Alem = any;

// TODO: (Store -> Ser usar persistencia) Load previous store
