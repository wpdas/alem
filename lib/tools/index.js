State.init({ stores: [] });

const useStore = (storeKey, obj) => {
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

  //   if obj is not sent, then, return its "values" and "update" method
  if (!obj) {
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
  }

  // if obj is sent, then, return "update" and "getValues"
  return {
    update: (updateObj) => {
      const updateParsedObj = {};
      Object.keys(updateObj).forEach(
        (key) => (updateParsedObj[`${storeKey}_${key}`] = updateObj[key]),
      );
      State.update(updateParsedObj);
    },
    getValues: () => {
      const getParsedObj = {};
      Object.keys(state).forEach((key) => {
        if (key.includes(`${storeKey}_`)) {
          getParsedObj[key.replace(`${storeKey}_`, "")] = state[key];
        }
      });
      return getParsedObj;
    },
  };
};
