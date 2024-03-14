import { Route } from "./tools";
import { routeUpdateObservable } from "./utils";

/**
 * Watch location changes and get routes props
 * @param cb
 */
export const watchLocation = (
  cb: (routeProps: {
    activeRoute: string;
    parameterName: string;
    routes: Route[];
  }) => void,
) => {
  if (cb) {
    routeUpdateObservable.subscribe(cb);
  }
};
