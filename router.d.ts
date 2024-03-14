/**
 * Route register
 */
export type Route = {
  path: string;
  component: () => JSX.Element;
};

/**
 * Defines how the routes will behave
 *
 * `URLBased`: Update the URL and reload/load page
 * `ContentBased`: Doesn't update the URL and doesn't reload page
 *
 * E.g.:
 * ```
 * const HomeRoute = createRoute("home", HomePage);
 * const ProfileRoute = createRoute("profile", ProfilePage);
 * return <Routes routes={[HomeRoute, ProfileRoute]} type="URLBased" />;
 * ```
 */
export type RouteType = "URLBased" | "ContentBased";

type RoutesProps = {
  routes: Route[];
  /**
   * Defines how the routes will behave. Default is `URLBased`.
   *
   * `URLBased`: Update the URL and reload/load page;
   * `ContentBased`: Doesn't update the URL and doesn't reload page.
   *
   * Consider using `URLBased` if your project's URL paths are important to its functionality. E.g.: sharing a link for a specific page.
   */
  type?: RouteType;
  /**
   * Parameter name to store current route name. Default is "path".
   */
  parameterName?: string;
};

/**
 * Create Routes
 */
export declare const Routes: (props: RoutesProps) => JSX.Element | "";

type RouteLinkProps = {
  to: string;
  children: JSX.Element;
  className?: string;
  onClick?: () => void;
};

/**
 * Route Link to access routes.
 */
export declare const RouteLink: (props: RouteLinkProps) => JSX.Element;

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
// export declare const useLocation: () => {
//   /**
//    * The path of the current Route.
//    */
//   pathname: string;
//   /**
//    * Routes available
//    */
//   routes: string[];
//   /**
//    * Is routes ready?
//    */
//   isRoutesReady: boolean;
// };
