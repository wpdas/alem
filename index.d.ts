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
 * Route Link to access routes
 */
export declare const RouteLink: ({
  to,
  children,
}: RouteLinkProps) => JSX.Element;

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
