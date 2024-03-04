/**
 * Get URL params and returns an object of key/value pairs objects
 */
export declare const useParams: () => {
  [values: string]: any;
};

/**
 * This hook returns the current location object.
 * This can be useful if you'd like to perform some side effect whenever the current location changes.
 */
export declare const useLocation: () => {
  /**
   * The path of the current Route.
   */
  pathname: string;
  /**
   * Routes available
   */
  routes: string[];
};
