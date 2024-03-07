// Store

// Alem control states
// alemStoreReady: used to check when the store is ready
// alemRouteSystemInitialized: used to check if route is ready to be used
// alemRouteBlocked: used to force navigate to other paths even when the "path=" parameter is present into the URL
State.init({
  alemStoreReady: false,
  alemRouteSystemInitialized: false,
  alemRouteBlocked: true,
  // Some resources can change its behaviour depending of the environment
  // This is just to help out during the development process. Final result
  // is going to be the same.
  // #PORT# is a marker that is going to be changed during the build process
  alemEnvironment: ":::ENV:::", // production | development
  // During development, if the route is of type ContentBased, it will return to the
  // first registered route every time a file is changed. This property enables or
  // disables this behavior.
  alemConfig_maintainRouteWhenDeveloping: ":::MAINTAIN_ROUTE:::", // boolean
  // Fonts
  alemFontsLoaded: false,
  alemFontsBody: "", // store fonts in css format
});

// Load previous store
if (!state.alemStoreReady) {
  promisify(
    () => Storage.privateGet("alem:store"),
    (storeData) => {
      // Check if previous storage has data
      if (Object.keys(storeData).length > 1) {
        State.update({
          alemStoreReady: true,
          ...storeData,
          stores: storeData?.stores || [],
        });
      } else {
        State.update({ alemStoreReady: true, stores: [] });
      }
    },
    () => {
      State.update({ alemStoreReady: true, stores: [] });
    },
    300,
  );
}

if (!state.alemStoreReady) {
  return <AlemSpinner />;
}

/**
 * createStore - State Management
 */

// Remove state props that are used to control the Alem library states
const removeAlemPropsFromState = (stateObj) => {
  delete stateObj.alemStoreReady;
  delete stateObj.alemRouteSystemInitialized;
  delete stateObj.alemFontsLoaded;
  delete stateObj.alemFontsBody;
  delete stateObj.alemRouteBlocked;
  delete stateObj.alemEnvironment;
  delete stateObj.alemConfig_maintainRouteWhenDeveloping;
  return stateObj;
};

const ALEM_USESTORE_KEY_SEPARATOR = "::";

const createStore = (storeKey, obj) => {
  // store was not initialized yet & obj is available...
  if (!state.stores.includes(storeKey) && obj && state.alemStoreReady) {
    const initParsedObj = {};
    Object.keys(obj).forEach(
      (key) =>
        (initParsedObj[`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}${key}`] =
          obj[key]),
    );

    const updatedStores = state.stores
      ? [...state.stores, storeKey]
      : [storeKey];

    const updatedState = removeAlemPropsFromState({
      ...state,
      ...initParsedObj,
      stores: updatedStores,
    });
    State.update(updatedState);
    Storage.privateSet("alem:store", updatedState);
  }
};

/**
 * useStore - State Management
 */
const useStore = (storeKey) => {
  // return its "values" and "update" method
  const getParsedObj = {};
  Object.keys(state).forEach((key) => {
    if (key.includes(`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}`)) {
      getParsedObj[
        key.replace(`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}`, "")
      ] = state[key];
    }
  });
  return {
    // values
    ...getParsedObj,
    // update method
    update: (updateObj) => {
      if (state.alemStoreReady) {
        const updateParsedObj = {};
        Object.keys(updateObj).forEach(
          (key) =>
            (updateParsedObj[
              `${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}${key}`
            ] = updateObj[key]),
        );
        State.update(updateParsedObj);

        const updatedState = removeAlemPropsFromState({ ...state });
        Storage.privateSet(
          "alem:store",
          removeAlemPropsFromState(updatedState),
        );
      }
    },
  };
};

/**
 * clearStore - State Management
 */
const clearStore = () => {
  Storage.privateSet("alem:store", {});
};

/**
 * Get all store data
 */
const getStore = () => {
  const storesData = {};
  if (state.stores) {
    const stateKeys = Object.keys(state);
    state.stores.forEach((storeKey) => {
      // ignore alem states
      if (!storeKey.includes("alem:")) {
        stateKeys.forEach((stateKey) => {
          if (stateKey.includes(storeKey)) {
            // create object for key if it doesn't exist
            if (!storesData[storeKey]) {
              storesData[storeKey] = {};
            }

            storesData[storeKey][
              stateKey.replace(`${storeKey}${ALEM_USESTORE_KEY_SEPARATOR}`, "")
            ] = state[stateKey];
          }
        });
      }
    });
  }

  return storesData;
};
