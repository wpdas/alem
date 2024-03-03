// -- ROUTES --

/**
 * Route register
 */
export type Route = {
  path: string;
  component: () => JSX.Element;
};

type RoutesProps = {
  routes: Route[];
};

/**
 * Create Routes
 */
export declare const Routes: ({ routes }: RoutesProps) => JSX.Element | "";

type RouteLinkProps = {
  to: string;
  children: JSX.Element;
};

/**
 * Route Link to access routes.
 * Update the URL. Slower than `ContentRouteLink`.
 *
 * Consider using this one if the URL path is important for your project. E.g.: sharing a link for a specific page.
 */
export declare const RouteLink: ({
  to,
  children,
}: RouteLinkProps) => JSX.Element;

/**
 * Content Route Link to access routes.
 * Doesn't update the URL. Faster than `RouteLink`.
 *
 * Consider using `RouteLink` if your project's URL paths are important to its functionality. E.g.: sharing a link for a specific page.
 */
export declare const ContentRouteLink: ({
  to,
  children,
}: RouteLinkProps) => JSX.Element;

/**
 * Go programmatically to the route ("route Path").
 *
 * This is NOT going to update the URL path.
 */
export declare const navigate: (routePath: string) => void;

/**
 * Create Route child
 */
export declare const createRoute: (
  path: string,
  component: () => JSX.Element,
) => Route;

// -- HOOKS --

/**
 * Get query objects
 */
export declare const useQuery: () => {
  [values: string]: any;
};

// -- STATE MANAGEMENT --

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
export declare const useStore: (storeKey: string) => {
  //TODO: create generics
  update: (updateState: Record<any, any>) => void;
  [values: string]: any;
};

/**
 * State Management - create store
 */
export declare const createStore: (storeKey: string, initialState: {}) => void;

// -- UTILS --

/**
 * Call resolve or reject for a given caller
 * E.g:
 * ```
 * const getStorage = () => Storage.get('my-key');
 * const resolve = (storageData) => console.log(storageData);
 * const reject = () => console.log('Error');
 * const timeout = 5000; // 5sec
 * promisify(getStorage, resolve, reject, timeout);
 * ```
 *
 * Default timeout is 10 seconds
 */
export declare const promisify: (
  caller: () => any,
  resolve: (data: any) => void,
  reject?: () => void,
  _timeout?: number,
) => void;
