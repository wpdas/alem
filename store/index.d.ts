/**
 * State Management - useStore Hook
 *
 * Creating
 * `createStore('myStore', {age: 12, name: 'Liz'});`
 *
 * Custom Hook - Reading
 * `const useMyStore = () => useStore('myStore');`
 *
 * Reading from custom hook
 * `const { age, name, update } = useMyStore();`
 *
 * Updating / Creating new value
 * `update({ age: 15, eyes: 'dark' });`
 */
export declare const useStore: (storeKey: string) => {
  //TODO: create generics
  update: (updateState: Record<any, any>) => void;
  [values: string]: any;
};

/**
 * State Management - create store
 */
export declare const createStore: (storeKey: string, initialState: {}) => void;
