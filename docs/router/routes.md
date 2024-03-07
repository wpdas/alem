## Routes

This component is responsible for managing the content to be displayed on the screen according to the active route. You can use the `createRoute` resource to create application routes and pass them to Routes.

```tsx
import { Routes, createRoute } from "alem/router";

import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

const AppRoutes = () => {
  // Creating routes
  const FeatureOverviewRoute = createRoute("home", HomePage);
  const StateManagementRoute = createRoute("profile", ProfilePage);

  // Initializing Routes
  return (
    <Routes
      routes={[FeatureOverviewRoute, StateManagementRoute]}
      type="ContentBased"
    />
  );
};

export default AppRoutes;
```

## Types of Behavior

`Routes` can handle links in two ways:

- **URLBased:** This is the default behavior. Every link will reload the page by changing the URL structure in the browser;
- **ContentBased:** This behavior does not change the URL in the browser and does not reload the page. Therefore, it is faster to display content on the screen.

You can pass the type of behavior using the `type` property of Routes.

```html
<!-- URL Based -->
<Routes
  routes="{[FeatureOverviewRoute,"
  StateManagementRoute]}
  type="URLBased"
/>

<!-- Content Based -->
<Routes
  routes="{[FeatureOverviewRoute,"
  StateManagementRoute]}
  type="ContentBased"
/>
```
