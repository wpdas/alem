/**
 * State Management - useStore Hook
 *
 * ```
 * // Creating
 * createStore('myStore', {age: 12, name: 'Liz'});
 * // Custom Hook - Reading
 * const useMyStore = () => useStore('myStore');
 * // Reading from custom hook
 * const { age, name, update } = useMyStore();
 * // Updating / Creating new value
 * update({ age: 15, eyes: 'dark' });
 * ```
 */
export declare const useStore: <T>(storeKey: string) => {
  update: (updateState: T) => void;
} & T;

/**
 * State Management - create store
 */
export declare const createStore: (storeKey: string, initialState: {}) => void;

/**
 * State Management - clear all store data
 */
export declare const clearStore: () => void;

/**
 * Return all store items with their data
 */
export declare const getStore: () => Record<string, any>;
