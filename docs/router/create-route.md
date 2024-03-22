## Create Route

This feature is used to create routes. These routes must be passed to the `Router` component later.

```tsx
import { Router, createRoute } from "alem";

import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

const AppRoutes = () => {
  // Creating routes
  const FeatureOverviewRoute = createRoute("home", HomePage);
  const StateManagementRoute = createRoute("profile", ProfilePage);

  return (
    <Router
      parameterName="page" {/* Optional: default is "path" */}
      type="ContentBased" {/* Optional: default is "URLBased" */}
      routes={[FeatureOverviewRoute, StateManagementRoute]}
    />
  );
};

export default AppRoutes;
```
