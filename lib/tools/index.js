// Store
State.init({ stores: [] });

/**
 * createStore - State Management
 */

const createStore = (storeKey, obj) => {
  // store was not initialized yet & obj is available...
  if (!state.stores.includes(storeKey) && obj) {
    const initParsedObj = {};
    Object.keys(obj).forEach(
      (key) => (initParsedObj[`${storeKey}_${key}`] = obj[key]),
    );

    const updatedStores = state.stores
      ? [...state.stores, storeKey]
      : [storeKey];
    State.update({ ...state, ...initParsedObj, stores: updatedStores });
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
      const updateParsedObj = {};
      Object.keys(updateObj).forEach(
        (key) => (updateParsedObj[`${storeKey}_${key}`] = updateObj[key]),
      );
      State.update(updateParsedObj);
    },
  };
};
