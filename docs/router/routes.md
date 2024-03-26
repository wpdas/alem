## Routes

This component is responsible for managing the content to be displayed on the screen according to the active route. You can use the `createRoute` resource to create application routes and pass them to the Router.

```tsx
import { RouterProvider, Router, createRoute } from "alem";

import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

const AppRoutes = () => {

  // It must be placed above all resources that will use the Router tools.
  RouterProvider();

  // Creating routes
  const FeatureOverviewRoute = createRoute("home", HomePage);
  const StateManagementRoute = createRoute("profile", ProfilePage);

  const routes = [
    FeatureOverviewRoute,
    StateManagementRoute,
  ]

  // Initializing Routes
  return (
    <Router
      parameterName="tab" {/* Optional: default is "path" */}
      type="ContentBased" {/* Optional: default is "URLBased" */}
      routes={routes}
    />
  );
};

export default AppRoutes;
```

## Types of Behavior

`Router` can handle links in two ways:

- **URLBased:** This is the default behavior. Every link will reload the page by changing the URL structure in the browser;
- **ContentBased:** This behavior does not change the URL in the browser and does not reload the page. Therefore, it is faster to display content on the screen.

You can pass the type of behavior using the `type` property of Routes.

```tsx
/* URL Based */
<Router
  routes={[FeatureOverviewRoute, StateManagementRoute]}
  type="URLBased"
/>

/* Content Based */
<Router
  routes={[FeatureOverviewRoute, StateManagementRoute]}
  type="ContentBased"
/>
```
