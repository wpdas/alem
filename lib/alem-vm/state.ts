/**
 * Todos os items do state inicial
 */

import { Route, State, Storage, asyncFetch, state } from "./alem-vm";

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
    // System to send root properties to listeners
    rootPropsListeners: [],
    registerListenerHandler: (handler: (data: any) => void) => {
      if (!props.alem.rootPropsListeners.includes(handler)) {
        props.alem.rootPropsListeners.push(handler);
      }
    },
    unregisterListenerHandler: (handler: (data: any) => void) => {
      props.alem.rootPropsListeners = props.alem.rootPropsListeners.filter(
        (item) => item !== handler,
      );
    },

    ready: false,
    /**
     * Root project props
     */
    rootProps: props,
    // ==================================== Configs ====================================
    alemEnvironment: ":::ENV:::", // production | development
    keepRoute: ":::KEEP_ROUTE:::",
    previousRoute: null,
    previousRouteParams: null,

    // ==================================== APIs ====================================
    alemExternalStylesLoaded: false,
    alemExternalStylesBody: "",
  },
  // ======= FIM ALEM =======
};

State.init(AlemStateInitialBody);
// Note: força atualização do rootProps
State.update({ alem: { ...state.alem, rootProps: props } });

// Props para ser compartilhada com todos os Widgets
export const props = {
  ...props,

  // Alem
  alem: {
    ...state.alem,

    // ==================================== Routes ====================================
    // Alguns recursos do Routes vivem no escopo global, outros apenas dentro do componente

    /**
     * Create Routes
     * @param path
     * @param component
     * @returns
     */
    createRoute: (path, component) => ({ path, component }) as Route,

    /**
     * All parameters provided by the URL.
     * @returns
     */
    useParams: () => {
      let params = alemState().rootProps;
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
          // Cache response
          Storage.set(styleURL, response.body);

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
        // Try to get cached data first, if not available, proceed
        props.alem.promisify(
          () => Storage.get(styleURL),
          (response) => {
            stylesBody += response;
            loadedCounter += 1;

            if (loadedCounter === totalItems) {
              updateAlemState({
                alemExternalStylesLoaded: true,
                alemExternalStylesBody: stylesBody,
              });
            }
          },
          () => {
            loadStyle(styleURL);
          },
          100,
        );
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
      COMPONENTS_CODE: {},
    },
  },
};

// Try to load previous route for keep-route
if (props.alem.keepRoute) {
  if (!props.alem.ready) {
    props.alem.promisify(
      () => Storage.privateGet("alem::keep-route"),
      (data) => {
        updateAlemState({
          previousRoute: data.route,
          previousRouteParams: data.routeParams,
          ready: true,
        });
      },
      () => {
        updateAlemState({
          previousRoute: null,
          ready: true,
        });
      },
      300,
    );
  }
} else {
  updateAlemState({
    previousRoute: null,
    ready: true,
  });
}

// Chama todos os metodos guardados no alem.handlers quando a propriedade
// do root mudar
props.alem.rootPropsListeners.forEach((handler) => handler(props));

export type Alem = any;

// TODO: (Store -> Ser usar persistencia) Load previous store
