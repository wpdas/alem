## Create Route

This feature is used to create routes. These routes must be passed to the `Routes` component later.

```tsx
import { Routes, createRoute } from "alem/router";

import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

const AppRoutes = () => {
  // Creating routes
  const FeatureOverviewRoute = createRoute("home", HomePage);
  const StateManagementRoute = createRoute("profile", ProfilePage);

  return (
    <Routes
      routes={[FeatureOverviewRoute, StateManagementRoute]}
      type="ContentBased"
    />
  );
};

export default AppRoutes;
```
