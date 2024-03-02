// Store
// const previousStore = Storage.get("alem:store", "potlock.near/widget/Index");
const previousStore = Storage.privateGet("alem:store");

if (!previousStore) {
  // TODO: Pensar um fallback aqui
  return <AlemSpinner />;
}

console.log("previous store:", previousStore);

// const [storageReady, setStorageReady] = useState(
//   !!Storage.privateGet("alem:store"),
// );
// console.log("CHEEECK:", storageReady, Storage.privateGet("alem:store"));

// useEffect(() => {
//   if (previousStore && !storageReady) {
//     setStorageReady(true);
//   }
// }, [previousStore]);

State.init(previousStore ? { ...previousStore } : { stores: [] });

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
      const updateParsedObj = {};
      Object.keys(updateObj).forEach(
        (key) => (updateParsedObj[`${storeKey}_${key}`] = updateObj[key]),
      );
      // Storage.set('alem:store', { ...state, ...updateParsedObj });
      State.update(updateParsedObj);
      Storage.privateSet("alem:store", { ...state });
    },
  };
};
