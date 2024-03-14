import { Route } from "./router";

export * from "./bos";
export * from "./router";
export * from "./store";
export * from "./api";

// Mandar para arquivo watchers.d.ts depois
export declare const watchLocation: (
  cb: (routeProps: {
    activeRoute: string;
    parameterName: string;
    routes: Route[];
  }) => void,
) => void;
