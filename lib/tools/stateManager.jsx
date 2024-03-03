// Store

// Load previous store
State.init({ alemStoreReady: false });

promisify(
  () => Storage.privateGet("alem:store"),
  (storeData) => {
    State.update({ alemStoreReady: true, ...storeData });
  },
  () => {
    State.update({ alemStoreReady: true, stores: [] });
  },
  300,
);

if (!state.alemStoreReady) {
  return <AlemSpinner />;
}

/**
 * createStore - State Management
 */

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
    State.update({ ...state, ...initParsedObj, stores: updatedStores });
    Storage.privateSet("alem:store", {
      ...state,
      ...initParsedObj,
      stores: updatedStores,
    });
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
        // Storage.set('alem:store', { ...state, ...updateParsedObj });
        State.update(updateParsedObj);
        Storage.privateSet("alem:store", { ...state });
      }
    },
  };
};
