// Store

// Alem control states
State.init({ alemStoreReady: false, routeSystemInitialized: false });

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
  delete stateObj.routeSystemInitialized;
  return stateObj;
};

const createStore = (storeKey, obj) => {
  // store was not initialized yet & obj is available...
  if (!state.stores.includes(storeKey) && obj && state.alemStoreReady) {
    const initParsedObj = {};
    Object.keys(obj).forEach(
      (key) => (initParsedObj[`${storeKey}_${key}`] = obj[key]),
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
    if (key.includes(`${storeKey}_`)) {
      getParsedObj[key.replace(`${storeKey}_`, "")] = state[key];
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
          (key) => (updateParsedObj[`${storeKey}_${key}`] = updateObj[key]),
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
