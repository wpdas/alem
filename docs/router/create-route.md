## Create Route

Este recurso é usado para criar rotas. Essas rotas devem ser passadas para o componente `Routes` posteriormente.

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
