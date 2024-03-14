import { Route } from "./tools";

/**
 * Observable
 * @returns
 */
const Observable = <D>() => {
  let observers: Array<(data: D) => void> = [];
  let lastData: D;
  return {
    subscribe: (handler: (data: D) => void) => {
      // se ja tiver dado antigo, envia
      if (lastData) {
        handler(lastData);
      }

      if (!observers.includes(handler)) {
        observers.push(handler);
      }
    },

    unsubscribe: (handler: (data: D) => void) => {
      observers = observers.filter((subscriber) => subscriber !== handler);
    },

    notify: (data: D) => {
      lastData = data;
      observers.forEach((observer) => observer(data));
    },

    getLastData: () => lastData,

    clear: () => {
      observers = [];
    },
  };
};

// Lista de observables do Alem
export const routeUpdateObservable = Observable<{
  activeRoute: string;
  parameterName: string;
  routes: Route[];
}>();

/**
 * Create Routes
 * @param path
 * @param component
 * @returns
 */
export const createRoute = (path, component) => ({ path, component }) as Route;
